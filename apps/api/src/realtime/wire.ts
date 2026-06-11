import type { Board, Card, Column } from '../database/schema';
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

/** The wire protocol: every domain event becomes one `board:event` message in the board's room. */
export type WireEvent =
  | { type: 'board.renamed'; boardId: string; board: Board }
  | { type: 'board.deleted'; boardId: string }
  | { type: 'column.created'; boardId: string; column: Column }
  | { type: 'column.renamed'; boardId: string; column: Column }
  | { type: 'column.moved'; boardId: string; column: Column }
  | { type: 'column.deleted'; boardId: string; columnId: string }
  | { type: 'card.created'; boardId: string; card: Card }
  | { type: 'card.updated'; boardId: string; card: Card }
  | { type: 'card.moved'; boardId: string; card: Card }
  | { type: 'card.deleted'; boardId: string; columnId: string; cardId: string };

export type DomainEvent =
  | BoardRenamedEvent
  | BoardDeletedEvent
  | ColumnCreatedEvent
  | ColumnRenamedEvent
  | ColumnMovedEvent
  | ColumnDeletedEvent
  | CardCreatedEvent
  | CardUpdatedEvent
  | CardMovedEvent
  | CardDeletedEvent;

type DomainEventClass<E extends DomainEvent = DomainEvent> = new (...args: never[]) => E;

const factories = new Map<DomainEventClass, (event: DomainEvent) => WireEvent>();

function register<E extends DomainEvent>(
  eventClass: DomainEventClass<E>,
  factory: (event: E) => WireEvent,
): void {
  factories.set(eventClass, factory as (event: DomainEvent) => WireEvent);
}

register(BoardRenamedEvent, (e) => ({
  type: 'board.renamed',
  boardId: e.board.id,
  board: e.board,
}));
register(BoardDeletedEvent, (e) => ({ type: 'board.deleted', boardId: e.boardId }));
register(ColumnCreatedEvent, (e) => ({
  type: 'column.created',
  boardId: e.boardId,
  column: e.column,
}));
register(ColumnRenamedEvent, (e) => ({
  type: 'column.renamed',
  boardId: e.boardId,
  column: e.column,
}));
register(ColumnMovedEvent, (e) => ({ type: 'column.moved', boardId: e.boardId, column: e.column }));
register(ColumnDeletedEvent, (e) => ({
  type: 'column.deleted',
  boardId: e.boardId,
  columnId: e.columnId,
}));
register(CardCreatedEvent, (e) => ({ type: 'card.created', boardId: e.boardId, card: e.card }));
register(CardUpdatedEvent, (e) => ({ type: 'card.updated', boardId: e.boardId, card: e.card }));
register(CardMovedEvent, (e) => ({ type: 'card.moved', boardId: e.boardId, card: e.card }));
register(CardDeletedEvent, (e) => ({
  type: 'card.deleted',
  boardId: e.boardId,
  columnId: e.columnId,
  cardId: e.cardId,
}));

/** Single source for the relay's @EventsHandler subscription list. */
export const WIRED_EVENTS = [...factories.keys()];

const unmapped = (event: DomainEvent): never => {
  throw new Error(`No wire mapping registered for ${event.constructor.name}`);
};

export function toWire(event: DomainEvent): WireEvent {
  const factory = factories.get(event.constructor as DomainEventClass) ?? unmapped;
  return factory(event);
}

export function roomOf(boardId: string): string {
  return `board:${boardId}`;
}
