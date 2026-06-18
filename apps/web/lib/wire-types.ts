import type { Board, ChecklistItem, Column, WireCard } from './types';

/** A card comment with its author's display info resolved server-side. */
export interface CommentView {
  id: string;
  cardId: string;
  authorId: string | null;
  authorName: string;
  authorColor: string;
  body: string;
  createdAt: string;
}

export interface NotificationData {
  boardId?: string;
  cardId?: string;
  commentId?: string;
  actorName?: string;
  snippet?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  data: NotificationData;
  readAt: string | null;
  createdAt: string;
}

/** Live socket presence on a board (distinct from a persisted account member). */
export interface Member {
  socketId: string;
  name: string;
  color: string;
}

export interface Identity {
  name: string;
  color: string;
}

export type WireEvent =
  | { type: 'board.renamed'; boardId: string; board: Board }
  | { type: 'board.deleted'; boardId: string }
  | { type: 'column.created'; boardId: string; column: Column }
  | { type: 'column.renamed'; boardId: string; column: Column }
  | { type: 'column.moved'; boardId: string; column: Column }
  | { type: 'column.updated'; boardId: string; column: Column }
  | { type: 'column.deleted'; boardId: string; columnId: string }
  | { type: 'card.created'; boardId: string; card: WireCard }
  | { type: 'card.updated'; boardId: string; card: WireCard }
  | { type: 'card.moved'; boardId: string; card: WireCard }
  | { type: 'card.deleted'; boardId: string; columnId: string; cardId: string }
  | { type: 'card.label_attached'; boardId: string; cardId: string; labelId: string }
  | { type: 'card.label_detached'; boardId: string; cardId: string; labelId: string }
  | { type: 'card.assignee_changed'; boardId: string; card: WireCard }
  | { type: 'checklist.item_added'; boardId: string; cardId: string; item: ChecklistItem }
  | { type: 'checklist.item_updated'; boardId: string; cardId: string; item: ChecklistItem }
  | { type: 'checklist.item_deleted'; boardId: string; cardId: string; itemId: string }
  | { type: 'comment.created'; boardId: string; cardId: string; comment: CommentView }
  | { type: 'comment.deleted'; boardId: string; cardId: string; commentId: string };

/** Comment wire events — the card modal consumes these directly, not via the board store. */
export type CommentEvent = Extract<WireEvent, { type: 'comment.created' | 'comment.deleted' }>;

const WIRE_TYPES: ReadonlySet<string> = new Set([
  'board.renamed',
  'board.deleted',
  'column.created',
  'column.renamed',
  'column.moved',
  'column.updated',
  'column.deleted',
  'card.created',
  'card.updated',
  'card.moved',
  'card.deleted',
  'card.label_attached',
  'card.label_detached',
  'card.assignee_changed',
  'checklist.item_added',
  'checklist.item_updated',
  'checklist.item_deleted',
  'comment.created',
  'comment.deleted',
]);

/** Socket payloads arrive untyped — gate them before they reach the store. */
export function isWireEvent(value: unknown): value is WireEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as { type?: unknown; boardId?: unknown };
  return typeof candidate.boardId === 'string' && WIRE_TYPES.has(candidate.type as string);
}
