import { rankBetween } from '@/lib/rank';
import type { BoardView, Card, Column } from '@/lib/types';

interface Ranked {
  id: string;
  rank: string;
}

interface Neighbours {
  prev: string | null;
  next: string | null;
}

/** Mirrors the server's placement semantics: "before X", or end-of-list when beforeId is null. */
function neighbours(items: Ranked[], beforeId: string | null): Neighbours | null {
  if (beforeId === null) {
    return { prev: items.at(-1)?.rank ?? null, next: null };
  }
  const index = items.findIndex((item) => item.id === beforeId);
  if (index === -1) {
    return null;
  }
  return {
    prev: index > 0 ? (items[index - 1]?.rank ?? null) : null,
    next: items[index]?.rank ?? null,
  };
}

/** Predicts the card the server will broadcast for this move; null when the move is impossible. */
export function predictCardMove(
  view: BoardView,
  cardId: string,
  toColumnId: string,
  beforeCardId: string | null,
): Card | null {
  const card = view.columns.flatMap((column) => column.cards).find((item) => item.id === cardId);
  const target = view.columns.find((column) => column.id === toColumnId);
  if (!card || !target) {
    return null;
  }
  const placement = neighbours(
    target.cards.filter((item) => item.id !== cardId),
    beforeCardId,
  );
  if (!placement) {
    return null;
  }
  return { ...card, columnId: toColumnId, rank: rankBetween(placement.prev, placement.next) };
}

/** Predicts the column the server will broadcast for this move. */
export function predictColumnMove(
  view: BoardView,
  columnId: string,
  beforeColumnId: string | null,
): Column | null {
  const column = view.columns.find((item) => item.id === columnId);
  if (!column) {
    return null;
  }
  const placement = neighbours(
    view.columns.filter((item) => item.id !== columnId),
    beforeColumnId,
  );
  if (!placement) {
    return null;
  }
  return { ...column, rank: rankBetween(placement.prev, placement.next) };
}
