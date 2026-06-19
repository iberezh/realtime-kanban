'use client';

import { Button, Group, MultiSelect, Select, TextInput } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { useEffect, useRef, useState } from 'react';
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

  // Search is deferred: the query string updates only once typing pauses (300ms).
  const [text, setText] = useState(filter.text);
  const lastPushed = useRef(filter.text);
  const pushText = useDebouncedCallback((value: string) => {
    lastPushed.current = value;
    onChange({ ...filter, text: value });
  }, 300);

  // Re-sync the input when the text changes from elsewhere (e.g. the Clear button).
  useEffect(() => {
    if (filter.text !== lastPushed.current) {
      lastPushed.current = filter.text;
      setText(filter.text);
    }
  }, [filter.text]);

  return (
    <Group gap="xs" px="lg" pb="sm" wrap="wrap">
      <TextInput
        size="xs"
        placeholder="Search cards…"
        value={text}
        onChange={(event) => {
          const value = event.currentTarget.value;
          setText(value);
          pushText(value);
        }}
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
