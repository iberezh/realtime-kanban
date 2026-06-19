'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { BoardFilter, DueFilter } from '@/lib/card-filter';

const DUE_VALUES: readonly DueFilter[] = ['all', 'has', 'overdue'];

function parseFilter(params: URLSearchParams): BoardFilter {
  const due = params.get('due') as DueFilter | null;
  return {
    text: params.get('q') ?? '',
    labelIds: params.getAll('label'),
    assigneeId: params.get('assignee'),
    due: due && DUE_VALUES.includes(due) ? due : 'all',
  };
}

function toQuery(filter: BoardFilter): string {
  const params = new URLSearchParams();
  const text = filter.text.trim();
  if (text) {
    params.set('q', text);
  }
  for (const id of filter.labelIds) {
    params.append('label', id);
  }
  if (filter.assigneeId) {
    params.set('assignee', filter.assigneeId);
  }
  if (filter.due !== 'all') {
    params.set('due', filter.due);
  }
  return params.toString();
}

/** Board filter state mirrored to the URL query string, so it survives reloads and is shareable. */
export function useBoardFilter(): { filter: BoardFilter; setFilter: (next: BoardFilter) => void } {
  const router = useRouter();
  const pathname = usePathname();
  const query = useSearchParams().toString();

  const filter = useMemo(() => parseFilter(new URLSearchParams(query)), [query]);

  const setFilter = useCallback(
    (next: BoardFilter) => {
      const nextQuery = toQuery(next);
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  return { filter, setFilter };
}
