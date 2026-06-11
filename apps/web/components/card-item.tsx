'use client';

import { Paper, Text } from '@mantine/core';
import type { Card } from '@/lib/types';

interface CardItemProps {
  card: Card;
  onOpen: (card: Card) => void;
}

export function CardItem({ card, onOpen }: CardItemProps) {
  return (
    <Paper
      withBorder
      p="sm"
      radius="md"
      shadow="xs"
      onClick={() => onOpen(card)}
      style={{ cursor: 'pointer' }}
    >
      <Text size="sm" fw={500}>
        {card.title}
      </Text>
      {card.description && (
        <Text size="xs" c="dimmed" lineClamp={2} mt={4}>
          {card.description}
        </Text>
      )}
    </Paper>
  );
}
