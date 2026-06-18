import type { Board, Card, ChecklistItem, Column } from '../../database/schema';

export interface CardView extends Card {
  labelIds: string[];
  dueAt: Date | null;
  assigneeId: string | null;
  checklist: ChecklistItem[];
}

export interface ColumnView extends Column {
  cards: CardView[];
}

export interface BoardView extends Board {
  columns: ColumnView[];
}

export function assembleBoardView(
  board: Board,
  columns: Column[],
  cards: Card[],
  cardLabelIds: Map<string, string[]>,
  checklistByCard: Map<string, ChecklistItem[]>,
): BoardView {
  const byColumn = new Map<string, CardView[]>(columns.map((column) => [column.id, []]));
  for (const card of cards) {
    const cardView: CardView = {
      ...card,
      labelIds: cardLabelIds.get(card.id) ?? [],
      dueAt: card.dueAt ?? null,
      assigneeId: card.assigneeId ?? null,
      checklist: checklistByCard.get(card.id) ?? [],
    };
    byColumn.get(card.columnId)?.push(cardView);
  }
  return {
    ...board,
    columns: columns.map((column) => ({ ...column, cards: byColumn.get(column.id) ?? [] })),
  };
}
