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
import { type Member, PresenceService } from './presence.service';
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

  constructor(
    private readonly presence: PresenceService,
    private readonly queryBus: QueryBus,
  ) {}

  // Members hold the boardId legitimately (it only reaches them through authed APIs).
  @SubscribeMessage('board:join')
  @UsePipes(wsValidation)
  join(@ConnectedSocket() client: Socket, @MessageBody() dto: JoinBoardDto): { members: Member[] } {
    client.join(roomOf(dto.boardId));
    const members = this.presence.join(dto.boardId, {
      socketId: client.id,
      name: dto.name,
      color: dto.color,
    });
    this.broadcastPresence(dto.boardId, members);
    return { members };
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
    client.join(roomOf(boardId));
    const members = this.presence.join(boardId, { socketId: client.id, ...GUEST });
    this.broadcastPresence(boardId, members);
    return { boardId, members };
  }

  @SubscribeMessage('board:leave')
  @UsePipes(wsValidation)
  leave(@ConnectedSocket() client: Socket, @MessageBody() dto: LeaveBoardDto): void {
    client.leave(roomOf(dto.boardId));
    const members = this.presence.leave(dto.boardId, client.id);
    if (members) {
      this.broadcastPresence(dto.boardId, members);
    }
  }

  handleDisconnect(client: Socket): void {
    for (const { boardId, members } of this.presence.leaveAll(client.id)) {
      this.broadcastPresence(boardId, members);
    }
  }

  /** Called by the domain-event relay — the write path itself never sees sockets. */
  emitToBoard(event: WireEvent): void {
    this.server.to(roomOf(event.boardId)).emit('board:event', event);
  }

  private broadcastPresence(boardId: string, members: Member[]): void {
    this.server.to(roomOf(boardId)).emit('presence:state', { boardId, members });
  }
}
