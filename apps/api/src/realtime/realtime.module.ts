import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BoardGateway } from './board.gateway';
import { KanbanEventsRelay } from './events.relay';

@Module({
  imports: [CqrsModule],
  providers: [BoardGateway, KanbanEventsRelay],
})
export class RealtimeModule {}
