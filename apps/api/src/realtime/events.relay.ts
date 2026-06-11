import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { BoardGateway } from './board.gateway';
import { type DomainEvent, toWire, WIRED_EVENTS } from './wire';

/**
 * The only bridge between the write path and the realtime layer: domain
 * events go in, room broadcasts come out. Command handlers stay socket-free.
 * The subscription list comes straight from the wire registry, so adding an
 * event there is the single step needed to broadcast it.
 */
@EventsHandler(...WIRED_EVENTS)
export class KanbanEventsRelay implements IEventHandler<DomainEvent> {
  constructor(private readonly gateway: BoardGateway) {}

  handle(event: DomainEvent): void {
    this.gateway.emitToBoard(toWire(event));
  }
}
