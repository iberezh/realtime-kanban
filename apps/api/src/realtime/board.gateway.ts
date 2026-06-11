import { UsePipes, ValidationPipe } from '@nestjs/common';
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
import { JoinBoardDto, LeaveBoardDto } from './join-board.dto';
import { type Member, PresenceService } from './presence.service';
import { roomOf, type WireEvent } from './wire';

const wsValidation = new ValidationPipe({
  whitelist: true,
  transform: true,
  exceptionFactory: (errors) => new WsException(errors.map((e) => e.property).join(', ')),
});

@WebSocketGateway({ cors: { origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' } })
export class BoardGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly presence: PresenceService) {}

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
