'use client';

import { Paper, Stack, Text } from '@mantine/core';
import type { ColumnView } from '@/lib/types';
import { CardItem } from './card-item';

/** Read-only column for the public guest view — no add, drag, or menu. */
export function GuestColumn({ column }: { column: ColumnView }) {
  return (
    <Paper w={290} miw={290} p="sm" radius="md" bg="var(--mantine-color-default-hover)">
      <Stack gap="sm">
        <Text fw={600} size="sm">
          {column.title}
          <Text component="span" c="dimmed" ml={6}>
            {column.cards.length}
          </Text>
        </Text>
        <Stack gap="xs" mih={8}>
          {column.cards.map((card) => (
            <CardItem key={card.id} card={card} onOpen={() => undefined} />
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
