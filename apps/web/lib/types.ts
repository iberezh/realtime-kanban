/** Mirrors the API's database rows and wire protocol (apps/api/src/realtime/wire.ts). */

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
