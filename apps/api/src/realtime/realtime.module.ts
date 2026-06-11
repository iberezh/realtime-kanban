import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BoardGateway } from './board.gateway';
import { KanbanEventsRelay } from './events.relay';
import { PresenceService } from './presence.service';

@Module({
  imports: [CqrsModule],
  providers: [BoardGateway, PresenceService, KanbanEventsRelay],
})
export class RealtimeModule {}
