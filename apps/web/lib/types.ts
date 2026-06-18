/** Mirrors the API's database rows and wire protocol (apps/api/src/realtime/wire.ts). */

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  color: string;
}

export interface AccountProfile {
  id: string;
  name: string;
  plan: string;
}

export interface PublicProfile {
  user: UserProfile;
  account: AccountProfile;
}

export interface Board {
  id: string;
  title: string;
  createdAt: string;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  rank: string;
  createdAt: string;
}

export interface Card {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  rank: string;
  createdAt: string;
  updatedAt: string;
}

export interface ColumnView extends Column {
  cards: Card[];
}

export interface BoardView extends Board {
  columns: ColumnView[];
}

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
  | { type: 'column.deleted'; boardId: string; columnId: string }
  | { type: 'card.created'; boardId: string; card: Card }
  | { type: 'card.updated'; boardId: string; card: Card }
  | { type: 'card.moved'; boardId: string; card: Card }
  | { type: 'card.deleted'; boardId: string; columnId: string; cardId: string };

const WIRE_TYPES: ReadonlySet<string> = new Set([
  'board.renamed',
  'board.deleted',
  'column.created',
  'column.renamed',
  'column.moved',
  'column.deleted',
  'card.created',
  'card.updated',
  'card.moved',
  'card.deleted',
]);

/** Socket payloads arrive untyped — gate them before they reach the store. */
export function isWireEvent(value: unknown): value is WireEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as { type?: unknown; boardId?: unknown };
  return typeof candidate.boardId === 'string' && WIRE_TYPES.has(candidate.type as string);
}
