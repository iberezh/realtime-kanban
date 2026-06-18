import { isOverdue } from './format';
import type { Card } from './types';

export type DueFilter = 'all' | 'has' | 'overdue';

export interface BoardFilter {
  text: string;
  labelIds: string[];
  assigneeId: string | null;
  due: DueFilter;
}

export const EMPTY_FILTER: BoardFilter = { text: '', labelIds: [], assigneeId: null, due: 'all' };

export const isFilterActive = (filter: BoardFilter): boolean =>
  filter.text.trim() !== '' ||
  filter.labelIds.length > 0 ||
  filter.assigneeId !== null ||
  filter.due !== 'all';

export function cardMatchesFilter(card: Card, filter: BoardFilter): boolean {
  const text = filter.text.trim().toLowerCase();
  if (text) {
    const haystack = `${card.title} ${card.description ?? ''}`.toLowerCase();
    if (!haystack.includes(text)) {
      return false;
    }
  }
  if (filter.labelIds.length > 0 && !filter.labelIds.some((id) => card.labelIds.includes(id))) {
    return false;
  }
  if (filter.assigneeId !== null && card.assigneeId !== filter.assigneeId) {
    return false;
  }
  if (filter.due === 'has' && card.dueAt === null) {
    return false;
  }
  if (filter.due === 'overdue' && !(card.dueAt !== null && isOverdue(card.dueAt))) {
    return false;
  }
  return true;
}
