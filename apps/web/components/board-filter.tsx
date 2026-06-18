'use client';

import { Button, Group, MultiSelect, Select, TextInput } from '@mantine/core';
import { type BoardFilter, EMPTY_FILTER, isFilterActive } from '@/lib/card-filter';
import { useBoardStore } from '@/stores/board-store';

interface BoardFilterBarProps {
  filter: BoardFilter;
  onChange: (filter: BoardFilter) => void;
}

const DUE_OPTIONS = [
  { value: 'all', label: 'Any due date' },
  { value: 'has', label: 'Has due date' },
  { value: 'overdue', label: 'Overdue' },
];

export function BoardFilterBar({ filter, onChange }: BoardFilterBarProps) {
  const labels = useBoardStore((state) => state.labels);
  const members = useBoardStore((state) => state.accountMembers);

  return (
    <Group gap="xs" px="lg" pb="sm" wrap="wrap">
      <TextInput
        size="xs"
        placeholder="Search cards…"
        value={filter.text}
        onChange={(event) => onChange({ ...filter, text: event.currentTarget.value })}
        w={200}
      />
      <MultiSelect
        size="xs"
        placeholder="Labels"
        clearable
        w={180}
        data={labels.map((label) => ({ value: label.id, label: label.name }))}
        value={filter.labelIds}
        onChange={(labelIds) => onChange({ ...filter, labelIds })}
      />
      <Select
        size="xs"
        placeholder="Assignee"
        clearable
        w={160}
        data={members.map((member) => ({ value: member.userId, label: member.name }))}
        value={filter.assigneeId}
        onChange={(assigneeId) => onChange({ ...filter, assigneeId })}
      />
      <Select
        size="xs"
        w={150}
        data={DUE_OPTIONS}
        value={filter.due}
        allowDeselect={false}
        onChange={(due) => onChange({ ...filter, due: (due as BoardFilter['due']) ?? 'all' })}
      />
      {isFilterActive(filter) && (
        <Button size="xs" variant="subtle" onClick={() => onChange(EMPTY_FILTER)}>
          Clear
        </Button>
      )}
    </Group>
  );
}
