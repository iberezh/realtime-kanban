'use client';

import { ActionIcon, Checkbox, Group, Progress, Stack, Text, TextInput } from '@mantine/core';
import { useState } from 'react';
import { addChecklistItem, deleteChecklistItem, updateChecklistItem } from '@/lib/checklist-api';
import type { Card } from '@/lib/types';

const FAILED = 'Something went wrong — try again.';

/** Card checklist: add, toggle, and remove items; all changes round-trip through realtime. */
export function CardChecklist({ card }: { card: Card }) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const items = card.checklist;
  const done = items.filter((item) => item.done).length;

  // Surface failures instead of swallowing them; the store updates on the realtime echo.
  const run = (op: Promise<unknown>): void => {
    void op.then(() => setError(null)).catch(() => setError(FAILED));
  };

  const add = async (): Promise<void> => {
    const value = text.trim();
    if (!value) {
      return;
    }
    try {
      await addChecklistItem(card.id, value);
      setText('');
      setError(null);
    } catch {
      setError(FAILED);
    }
  };

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text size="sm" fw={500}>
          Checklist
        </Text>
        {items.length > 0 && (
          <Text size="xs" c="dimmed">
            {done}/{items.length}
          </Text>
        )}
      </Group>
      {items.length > 0 && (
        <Progress value={(done / items.length) * 100} size="sm" color="teal" radius="xl" />
      )}
      {items.map((item) => (
        <Group key={item.id} gap="xs" wrap="nowrap">
          <Checkbox
            size="xs"
            checked={item.done}
            onChange={(event) =>
              run(updateChecklistItem(item.id, { done: event.currentTarget.checked }))
            }
          />
          <Text size="sm" flex={1} {...(item.done ? { td: 'line-through', c: 'dimmed' } : {})}>
            {item.text}
          </Text>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="red"
            aria-label="Delete item"
            onClick={() => run(deleteChecklistItem(item.id))}
          >
            ×
          </ActionIcon>
        </Group>
      ))}
      <TextInput
        size="xs"
        placeholder="Add an item…"
        value={text}
        onChange={(event) => setText(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            void add();
          }
        }}
      />
      {error && (
        <Text size="xs" c="red">
          {error}
        </Text>
      )}
    </Stack>
  );
}
