export interface RankedItem {
  id: string;
  rank: string;
}

export interface Placement {
  prev: string | null;
  next: string | null;
}

/**
 * Resolves "drop it before X" (or at the end, when `beforeId` is null) into
 * the pair of neighbouring ranks a new rank must fall between.
 * `items` must be ordered by rank and must not contain the moving item itself.
 * Returns null when `beforeId` does not exist in `items`.
 */
export function placementBefore(items: RankedItem[], beforeId: string | null): Placement | null {
  if (beforeId === null) {
    const last = items.at(-1);
    return { prev: last?.rank ?? null, next: null };
  }

  const index = items.findIndex((item) => item.id === beforeId);
  if (index === -1) {
    return null;
  }
  const next = items[index];
  const prev = index > 0 ? items[index - 1] : undefined;
  return { prev: prev?.rank ?? null, next: next?.rank ?? null };
}
