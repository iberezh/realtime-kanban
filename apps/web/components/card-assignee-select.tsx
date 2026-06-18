'use client';

import { Select } from '@mantine/core';
import { setAssignee } from '@/lib/api';
import type { Card } from '@/lib/types';
import { useBoardStore } from '@/stores/board-store';

/** Picks a card's assignee from the workspace members; clears to unassigned. */
export function CardAssigneeSelect({ card }: { card: Card }) {
  const members = useBoardStore((state) => state.accountMembers);
  const data = members.map((member) => ({ value: member.userId, label: member.name }));

  return (
    <Select
      label="Assignee"
      placeholder="Unassigned"
      clearable
      searchable
      data={data}
      value={card.assigneeId}
      onChange={(value) => void setAssignee(card.id, value).catch(() => undefined)}
    />
  );
}
