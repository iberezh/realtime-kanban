import type { Board, Card, ChecklistItem, Column } from '../../database/schema';

export class BoardCreatedEvent {
  constructor(
    public readonly board: Board,
    public readonly actorId: string,
  ) {}
}
export class BoardRenamedEvent {
  constructor(
    public readonly board: Board,
    public readonly actorId: string,
  ) {}
}
export class BoardDeletedEvent {
  constructor(
    public readonly boardId: string,
    public readonly actorId: string,
  ) {}
}
export class ColumnCreatedEvent {
  constructor(
    public readonly boardId: string,
    public readonly column: Column,
    public readonly actorId: string,
  ) {}
}
export class ColumnRenamedEvent {
  constructor(
    public readonly boardId: string,
    public readonly column: Column,
    public readonly actorId: string,
  ) {}
}
export class ColumnMovedEvent {
  constructor(
    public readonly boardId: string,
    public readonly column: Column,
    public readonly actorId: string,
  ) {}
}
export class ColumnDeletedEvent {
  constructor(
    public readonly boardId: string,
    public readonly columnId: string,
    public readonly actorId: string,
  ) {}
}
export class ColumnUpdatedEvent {
  constructor(
    public readonly boardId: string,
    public readonly column: Column,
    public readonly actorId: string,
  ) {}
}
export class CardCreatedEvent {
  constructor(
    public readonly boardId: string,
    public readonly card: Card,
    public readonly actorId: string,
  ) {}
}
export class CardUpdatedEvent {
  constructor(
    public readonly boardId: string,
    public readonly card: Card,
    public readonly actorId: string,
  ) {}
}
export class CardMovedEvent {
  constructor(
    public readonly boardId: string,
    public readonly card: Card,
    public readonly actorId: string,
  ) {}
}
export class CardDeletedEvent {
  constructor(
    public readonly boardId: string,
    public readonly columnId: string,
    public readonly cardId: string,
    public readonly actorId: string,
  ) {}
}
export class CardLabelAttachedEvent {
  constructor(
    public readonly boardId: string,
    public readonly cardId: string,
    public readonly labelId: string,
    public readonly actorId: string,
  ) {}
}
export class CardLabelDetachedEvent {
  constructor(
    public readonly boardId: string,
    public readonly cardId: string,
    public readonly labelId: string,
    public readonly actorId: string,
  ) {}
}
export class CardAssigneeChangedEvent {
  constructor(
    public readonly boardId: string,
    public readonly card: Card,
    public readonly actorId: string,
  ) {}
}
export class ChecklistItemAddedEvent {
  constructor(
    public readonly boardId: string,
    public readonly cardId: string,
    public readonly item: ChecklistItem,
    public readonly actorId: string,
  ) {}
}
export class ChecklistItemUpdatedEvent {
  constructor(
    public readonly boardId: string,
    public readonly cardId: string,
    public readonly item: ChecklistItem,
    public readonly actorId: string,
  ) {}
}
export class ChecklistItemDeletedEvent {
  constructor(
    public readonly boardId: string,
    public readonly cardId: string,
    public readonly itemId: string,
    public readonly actorId: string,
  ) {}
}

export interface CommentEventView {
  id: string;
  cardId: string;
  authorId: string | null;
  authorName: string;
  authorColor: string;
  body: string;
  createdAt: Date;
}

export class CommentCreatedEvent {
  constructor(
    public readonly boardId: string,
    public readonly cardId: string,
    public readonly comment: CommentEventView,
    public readonly actorId: string,
  ) {}
}

export class CommentDeletedEvent {
  constructor(
    public readonly boardId: string,
    public readonly cardId: string,
    public readonly commentId: string,
    public readonly actorId: string,
  ) {}
}
