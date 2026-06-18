'use client';

import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionIcon, Group, Menu, Paper, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import { createCard, deleteColumn } from '@/lib/api';
import type { Card, ColumnView as ColumnViewType } from '@/lib/types';
import { InlineAdd } from './inline-add';
import { SetWipModal } from './set-wip-modal';
import { SortableCard } from './sortable-card';

interface ColumnViewProps {
  column: ColumnViewType;
  onOpenCard: (card: Card) => void;
  cardMatches?: (card: Card) => boolean;
}

export function ColumnView({ column, onOpenCard, cardMatches }: ColumnViewProps) {
  const [wipOpen, setWipOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { column },
  });
  const overLimit = column.wipLimit !== null && column.cards.length > column.wipLimit;
  // WIP count reflects all cards; filtering only hides non-matching ones from view.
  const visible = cardMatches ? column.cards.filter(cardMatches) : column.cards;

  return (
    <Paper
      ref={setNodeRef}
      w={290}
      miw={290}
      p="sm"
      radius="md"
      bg="var(--mantine-color-default-hover)"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap">
          <Text
            fw={600}
            size="sm"
            truncate
            flex={1}
            style={{ cursor: 'grab' }}
            {...attributes}
            {...listeners}
          >
            {column.title}
            <Text
              component="span"
              c={overLimit ? 'red' : 'dimmed'}
              fw={overLimit ? 700 : 400}
              ml={6}
            >
              {column.cards.length}
              {column.wipLimit !== null && ` / ${column.wipLimit}`}
            </Text>
          </Text>
          <Menu position="bottom-end" withArrow>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" aria-label="Column menu">
                …
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => setWipOpen(true)}>Set WIP limit…</Menu.Item>
              <Menu.Item color="red" onClick={() => void deleteColumn(column.id)}>
                Delete column
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <SetWipModal
            columnId={column.id}
            current={column.wipLimit}
            opened={wipOpen}
            onClose={() => setWipOpen(false)}
          />
        </Group>
        <SortableContext
          items={visible.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          <Stack gap="xs" mih={8}>
            {visible.map((card) => (
              <SortableCard key={card.id} card={card} onOpen={onOpenCard} />
            ))}
          </Stack>
        </SortableContext>
        <InlineAdd
          placeholder="Add a card"
          onAdd={async (title) => {
            await createCard(column.id, title);
          }}
        />
      </Stack>
    </Paper>
  );
}
