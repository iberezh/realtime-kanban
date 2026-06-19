import { UsePipes, ValidationPipe } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BoardIdForShareTokenQuery } from '../share/share.queries';
import { GuestJoinDto, JoinBoardDto, LeaveBoardDto } from './join-board.dto';
import type { Member, SocketState } from './presence.types';
import { roomOf, type WireEvent } from './wire';

const wsValidation = new ValidationPipe({
  whitelist: true,
  transform: true,
  exceptionFactory: (errors) => new WsException(errors.map((e) => e.property).join(', ')),
});

/** Anonymous identity for guests arriving through a share link. */
const GUEST = { name: 'Guest', color: '#7c5cff' };

// CORS for the handshake comes from ConfiguredSocketIoAdapter (see main.ts).
@WebSocketGateway()
export class BoardGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly queryBus: QueryBus) {}

  // Members hold the boardId legitimately (it only reaches them through authed APIs).
  @SubscribeMessage('board:join')
  @UsePipes(wsValidation)
  async join(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: JoinBoardDto,
  ): Promise<{ members: Member[] }> {
    return { members: await this.enter(client, dto.boardId, { name: dto.name, color: dto.color }) };
  }

  // Guests never send a boardId: the share token is validated server-side first.
  @SubscribeMessage('guest:join')
  @UsePipes(wsValidation)
  async guestJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: GuestJoinDto,
  ): Promise<{ boardId: string; members: Member[] }> {
    const boardId = await this.queryBus.execute<BoardIdForShareTokenQuery, string | null>(
      new BoardIdForShareTokenQuery(dto.token),
    );
    if (!boardId) {
      throw new WsException('This share link is no longer active');
    }
    return { boardId, members: await this.enter(client, boardId, GUEST) };
  }

  @SubscribeMessage('board:leave')
  @UsePipes(wsValidation)
  async leave(@ConnectedSocket() client: Socket, @MessageBody() dto: LeaveBoardDto): Promise<void> {
    await client.leave(roomOf(dto.boardId));
    const state = client.data as SocketState;
    state.boards = (state.boards ?? []).filter((id) => id !== dto.boardId);
    await this.broadcastPresence(dto.boardId);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    // The socket has already left its rooms, so fetchSockets reports the survivors.
    for (const boardId of (client.data as SocketState).boards ?? []) {
      await this.broadcastPresence(boardId, client.id);
    }
  }

  /** Called by the domain-event relay — the write path itself never sees sockets. */
  emitToBoard(event: WireEvent): void {
    this.server.to(roomOf(event.boardId)).emit('board:event', event);
  }

  private async enter(
    client: Socket,
    boardId: string,
    identity: { name: string; color: string },
  ): Promise<Member[]> {
    const state = client.data as SocketState;
    state.member = { socketId: client.id, ...identity };
    state.boards = [...new Set([...(state.boards ?? []), boardId])];
    await client.join(roomOf(boardId));
    return this.broadcastPresence(boardId);
  }

  // Presence is derived from the room's sockets — across instances when the Redis adapter is on.
  private async broadcastPresence(boardId: string, excludeId?: string): Promise<Member[]> {
    const sockets = await this.server.in(roomOf(boardId)).fetchSockets();
    const members = sockets
      .filter((socket) => socket.id !== excludeId)
      .map((socket) => (socket.data as SocketState).member)
      .filter((member): member is Member => member !== undefined);
    this.server.to(roomOf(boardId)).emit('presence:state', { boardId, members });
    return members;
  }
}
