import type {
  BoardView,
  Card,
  ChecklistItem,
  Column,
  ColumnView,
  WireCard,
  WireEvent,
} from '@/lib/types';

const byRank = <T extends { rank: string }>(a: T, b: T): number => (a.rank < b.rank ? -1 : 1);

function findCard(view: BoardView, cardId: string): Card | undefined {
  for (const column of view.columns) {
    const card = column.cards.find((item) => item.id === cardId);
    if (card) {
      return card;
    }
  }
  return undefined;
}

function upsertColumn(view: BoardView, column: Column): BoardView {
  const existing = view.columns.find((item) => item.id === column.id);
  const next: ColumnView = { ...column, cards: existing?.cards ?? [] };
  const columns = [...view.columns.filter((item) => item.id !== column.id), next].sort(byRank);
  return { ...view, columns };
}

function upsertCard(view: BoardView, wire: WireCard): BoardView {
  // Events can outrun the loaded view: if the target column isn't here yet,
  // keep the view untouched rather than dropping the card on the floor.
  if (!view.columns.some((column) => column.id === wire.columnId)) {
    return view;
  }
  // Wire cards omit the joins — carry the labels and checklist we already know about.
  const prev = findCard(view, wire.id);
  const card: Card = { ...wire, labelIds: prev?.labelIds ?? [], checklist: prev?.checklist ?? [] };
  const columns = view.columns.map((column) => {
    const rest = column.cards.filter((item) => item.id !== card.id);
    if (column.id !== card.columnId) {
      return rest.length === column.cards.length ? column : { ...column, cards: rest };
    }
    return { ...column, cards: [...rest, card].sort(byRank) };
  });
  return { ...view, columns };
}

/** Replace the matching card with a transformed copy, leaving the rest untouched. */
function mapCard(view: BoardView, cardId: string, update: (card: Card) => Card): BoardView {
  return {
    ...view,
    columns: view.columns.map((column) => ({
      ...column,
      cards: column.cards.map((card) => (card.id === cardId ? update(card) : card)),
    })),
  };
}

const upsertChecklistItem = (checklist: ChecklistItem[], item: ChecklistItem): ChecklistItem[] =>
  [...checklist.filter((existing) => existing.id !== item.id), item].sort(byRank);

/** Pure reducer: server wire events → next board view. The store and optimistic updates share it. */
export function applyEvent(view: BoardView, event: WireEvent): BoardView {
  switch (event.type) {
    case 'board.renamed':
      return { ...view, title: event.board.title };
    case 'board.deleted':
      return view;
    case 'column.created':
    case 'column.renamed':
    case 'column.moved':
    case 'column.updated':
      return upsertColumn(view, event.column);
    case 'column.deleted':
      return { ...view, columns: view.columns.filter((column) => column.id !== event.columnId) };
    case 'card.created':
    case 'card.updated':
    case 'card.moved':
    case 'card.assignee_changed':
      return upsertCard(view, event.card);
    case 'card.label_attached':
      return mapCard(view, event.cardId, (card) => ({
        ...card,
        labelIds: card.labelIds.includes(event.labelId)
          ? card.labelIds
          : [...card.labelIds, event.labelId],
      }));
    case 'card.label_detached':
      return mapCard(view, event.cardId, (card) => ({
        ...card,
        labelIds: card.labelIds.filter((id) => id !== event.labelId),
      }));
    case 'checklist.item_added':
    case 'checklist.item_updated':
      return mapCard(view, event.cardId, (card) => ({
        ...card,
        checklist: upsertChecklistItem(card.checklist, event.item),
      }));
    case 'checklist.item_deleted':
      return mapCard(view, event.cardId, (card) => ({
        ...card,
        checklist: card.checklist.filter((item) => item.id !== event.itemId),
      }));
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
