'use client';

import { Avatar, Badge, Box, Group, Paper, Stack, Text, Tooltip } from '@mantine/core';
import { dueLabel, initials, isOverdue } from '@/lib/format';
import type { Card } from '@/lib/types';
import { useBoardStore } from '@/stores/board-store';

interface CardItemProps {
  card: Card;
  onOpen: (card: Card) => void;
}

export function CardItem({ card, onOpen }: CardItemProps) {
  const labels = useBoardStore((state) => state.labels);
  const members = useBoardStore((state) => state.accountMembers);
  const cardLabels = labels.filter((label) => card.labelIds.includes(label.id));
  const assignee = members.find((member) => member.userId === card.assigneeId);

  return (
    <Paper
      withBorder
      p="sm"
      radius="md"
      shadow="xs"
      onClick={() => onOpen(card)}
      style={{ cursor: 'pointer' }}
    >
      <Stack gap={6}>
        {cardLabels.length > 0 && (
          <Group gap={4}>
            {cardLabels.map((label) => (
              <Tooltip key={label.id} label={label.name} withArrow>
                <Box w={26} h={6} style={{ background: label.color, borderRadius: 999 }} />
              </Tooltip>
            ))}
          </Group>
        )}
        <Text size="sm" fw={500}>
          {card.title}
        </Text>
        {card.description && (
          <Text size="xs" c="dimmed" lineClamp={2}>
            {card.description}
          </Text>
        )}
        {(card.dueAt || assignee || card.checklist.length > 0) && (
          <Group justify="space-between" mt={2}>
            <Group gap={6}>
              {card.dueAt && (
                <Badge size="sm" variant="light" color={isOverdue(card.dueAt) ? 'red' : 'gray'}>
                  {dueLabel(card.dueAt)}
                </Badge>
              )}
              {card.checklist.length > 0 && (
                <Badge
                  size="sm"
                  variant="light"
                  color={card.checklist.every((item) => item.done) ? 'teal' : 'gray'}
                >
                  ☑ {card.checklist.filter((item) => item.done).length}/{card.checklist.length}
                </Badge>
              )}
            </Group>
            {assignee && (
              <Tooltip label={assignee.name} withArrow>
                <Avatar
                  size="sm"
                  radius="xl"
                  styles={{ placeholder: { background: assignee.color, color: '#fff' } }}
                >
                  {initials(assignee.name)}
                </Avatar>
              </Tooltip>
            )}
          </Group>
        )}
      </Stack>
    </Paper>
  );
}
