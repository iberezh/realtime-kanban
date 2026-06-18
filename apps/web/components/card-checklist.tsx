'use client';

import { ActionIcon, Checkbox, Group, Progress, Stack, Text, TextInput } from '@mantine/core';
import { useState } from 'react';
import { addChecklistItem, deleteChecklistItem, updateChecklistItem } from '@/lib/checklist-api';
import type { Card } from '@/lib/types';

/** Card checklist: add, toggle, and remove items; all changes round-trip through realtime. */
export function CardChecklist({ card }: { card: Card }) {
  const [text, setText] = useState('');
  const items = card.checklist;
  const done = items.filter((item) => item.done).length;

  const add = async (): Promise<void> => {
    const value = text.trim();
    if (!value) {
      return;
    }
    setText('');
    await addChecklistItem(card.id, value).catch(() => undefined);
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
              void updateChecklistItem(item.id, { done: event.currentTarget.checked }).catch(
                () => undefined,
              )
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
            onClick={() => void deleteChecklistItem(item.id).catch(() => undefined)}
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
    </Stack>
  );
}
