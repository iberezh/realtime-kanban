'use client';

import { Chip, Group, Text } from '@mantine/core';
import { attachLabel, detachLabel } from '@/lib/api';
import type { Card } from '@/lib/types';
import { useBoardStore } from '@/stores/board-store';

/** Toggles the caller's workspace labels on a card; changes round-trip through realtime events. */
export function CardLabelPicker({ card }: { card: Card }) {
  const labels = useBoardStore((state) => state.labels);

  if (labels.length === 0) {
    return (
      <Text size="xs" c="dimmed">
        No labels yet — create some from “Labels” in the board header.
      </Text>
    );
  }

  const toggle = (labelId: string, attached: boolean): void => {
    void (attached ? detachLabel(card.id, labelId) : attachLabel(card.id, labelId)).catch(
      () => undefined,
    );
  };

  return (
    <Group gap={6}>
      {labels.map((label) => {
        const attached = card.labelIds.includes(label.id);
        return (
          <Chip
            key={label.id}
            checked={attached}
            size="sm"
            variant={attached ? 'filled' : 'outline'}
            onChange={() => toggle(label.id, attached)}
            styles={{
              label: attached
                ? { background: label.color, color: '#fff', borderColor: label.color }
                : { borderColor: label.color, color: label.color },
            }}
          >
            {label.name}
          </Chip>
        );
      })}
    </Group>
  );
}
