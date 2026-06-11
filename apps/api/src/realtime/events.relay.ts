import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import {
  BoardDeletedEvent,
  BoardRenamedEvent,
  CardCreatedEvent,
  CardDeletedEvent,
  CardMovedEvent,
  CardUpdatedEvent,
  ColumnCreatedEvent,
  ColumnDeletedEvent,
  ColumnMovedEvent,
  ColumnRenamedEvent,
} from '../kanban/events/kanban.events';
import { BoardGateway } from './board.gateway';
import { type DomainEvent, toWire } from './wire';

/**
 * The only bridge between the write path and the realtime layer: domain
 * events go in, room broadcasts come out. Command handlers stay socket-free.
 */
@EventsHandler(
  BoardRenamedEvent,
  BoardDeletedEvent,
  ColumnCreatedEvent,
  ColumnRenamedEvent,
  ColumnMovedEvent,
  ColumnDeletedEvent,
  CardCreatedEvent,
  CardUpdatedEvent,
  CardMovedEvent,
  CardDeletedEvent,
)
export class KanbanEventsRelay implements IEventHandler<DomainEvent> {
  constructor(private readonly gateway: BoardGateway) {}

  handle(event: DomainEvent): void {
    this.gateway.emitToBoard(toWire(event));
  }
}
