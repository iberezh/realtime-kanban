import type { Board, Card, Column } from '../../database/schema';

/** Every event carries the board id so the realtime layer can route it to the right room. */

export class BoardCreatedEvent {
  constructor(public readonly board: Board) {}
}

export class BoardRenamedEvent {
  constructor(public readonly board: Board) {}
}

export class BoardDeletedEvent {
  constructor(public readonly boardId: string) {}
}

export class ColumnCreatedEvent {
  constructor(
    public readonly boardId: string,
    public readonly column: Column,
  ) {}
}

export class ColumnRenamedEvent {
  constructor(
    public readonly boardId: string,
    public readonly column: Column,
  ) {}
}

export class ColumnMovedEvent {
  constructor(
    public readonly boardId: string,
    public readonly column: Column,
  ) {}
}

export class ColumnDeletedEvent {
  constructor(
    public readonly boardId: string,
    public readonly columnId: string,
  ) {}
}

export class CardCreatedEvent {
  constructor(
    public readonly boardId: string,
    public readonly card: Card,
  ) {}
}

export class CardUpdatedEvent {
  constructor(
    public readonly boardId: string,
    public readonly card: Card,
  ) {}
}

export class CardMovedEvent {
  constructor(
    public readonly boardId: string,
    public readonly card: Card,
  ) {}
}

export class CardDeletedEvent {
  constructor(
    public readonly boardId: string,
    public readonly columnId: string,
    public readonly cardId: string,
  ) {}
}
