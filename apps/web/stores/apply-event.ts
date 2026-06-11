import type { BoardView, Card, Column, ColumnView, WireEvent } from '@/lib/types';

const byRank = <T extends { rank: string }>(a: T, b: T): number => (a.rank < b.rank ? -1 : 1);

function upsertColumn(view: BoardView, column: Column): BoardView {
  const existing = view.columns.find((item) => item.id === column.id);
  const next: ColumnView = { ...column, cards: existing?.cards ?? [] };
  const columns = [...view.columns.filter((item) => item.id !== column.id), next].sort(byRank);
  return { ...view, columns };
}

function upsertCard(view: BoardView, card: Card): BoardView {
  const columns = view.columns.map((column) => {
    const rest = column.cards.filter((item) => item.id !== card.id);
    if (column.id !== card.columnId) {
      return rest.length === column.cards.length ? column : { ...column, cards: rest };
    }
    return { ...column, cards: [...rest, card].sort(byRank) };
  });
  return { ...view, columns };
}

/** Pure reducer: server wire events → next board view. The store and (later) optimistic updates share it. */
export function applyEvent(view: BoardView, event: WireEvent): BoardView {
  switch (event.type) {
    case 'board.renamed':
      return { ...view, title: event.board.title };
    case 'board.deleted':
      return view;
    case 'column.created':
    case 'column.renamed':
    case 'column.moved':
      return upsertColumn(view, event.column);
    case 'column.deleted':
      return { ...view, columns: view.columns.filter((column) => column.id !== event.columnId) };
    case 'card.created':
    case 'card.updated':
    case 'card.moved':
      return upsertCard(view, event.card);
    case 'card.deleted':
      return {
        ...view,
        columns: view.columns.map((column) =>
          column.id === event.columnId
            ? { ...column, cards: column.cards.filter((card) => card.id !== event.cardId) }
            : column,
        ),
      };
    default:
      return view;
  }
}
