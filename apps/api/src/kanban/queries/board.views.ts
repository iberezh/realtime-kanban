import type { Board, Card, Column } from '../../database/schema';

export interface ColumnView extends Column {
  cards: Card[];
}

export interface BoardView extends Board {
  columns: ColumnView[];
}

export function assembleBoardView(board: Board, columns: Column[], cards: Card[]): BoardView {
  const byColumn = new Map<string, Card[]>(columns.map((column) => [column.id, []]));
  for (const card of cards) {
    byColumn.get(card.columnId)?.push(card);
  }
  return {
    ...board,
    columns: columns.map((column) => ({ ...column, cards: byColumn.get(column.id) ?? [] })),
  };
}
