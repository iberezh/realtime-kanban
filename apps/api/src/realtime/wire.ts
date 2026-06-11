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

export function toWire(event: DomainEvent): WireEvent {
  if (event instanceof BoardRenamedEvent) {
    return { type: 'board.renamed', boardId: event.board.id, board: event.board };
  }
  if (event instanceof BoardDeletedEvent) {
    return { type: 'board.deleted', boardId: event.boardId };
  }
  if (event instanceof ColumnCreatedEvent) {
    return { type: 'column.created', boardId: event.boardId, column: event.column };
  }
  if (event instanceof ColumnRenamedEvent) {
    return { type: 'column.renamed', boardId: event.boardId, column: event.column };
  }
  if (event instanceof ColumnMovedEvent) {
    return { type: 'column.moved', boardId: event.boardId, column: event.column };
  }
  if (event instanceof ColumnDeletedEvent) {
    return { type: 'column.deleted', boardId: event.boardId, columnId: event.columnId };
  }
  if (event instanceof CardCreatedEvent) {
    return { type: 'card.created', boardId: event.boardId, card: event.card };
  }
  if (event instanceof CardUpdatedEvent) {
    return { type: 'card.updated', boardId: event.boardId, card: event.card };
  }
  if (event instanceof CardMovedEvent) {
    return { type: 'card.moved', boardId: event.boardId, card: event.card };
  }
  return {
    type: 'card.deleted',
    boardId: event.boardId,
    columnId: event.columnId,
    cardId: event.cardId,
  };
}

export function roomOf(boardId: string): string {
  return `board:${boardId}`;
}
