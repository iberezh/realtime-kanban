'use client';

import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionIcon, Group, Menu, Paper, Stack, Text } from '@mantine/core';
import { createCard, deleteColumn } from '@/lib/api';
import type { Card, ColumnView as ColumnViewType } from '@/lib/types';
import { InlineAdd } from './inline-add';
import { SortableCard } from './sortable-card';

interface ColumnViewProps {
  column: ColumnViewType;
  onOpenCard: (card: Card) => void;
}

export function ColumnView({ column, onOpenCard }: ColumnViewProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { column },
  });

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
            <Text component="span" c="dimmed" ml={6}>
              {column.cards.length}
            </Text>
          </Text>
          <Menu position="bottom-end" withArrow>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" aria-label="Column menu">
                …
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item color="red" onClick={() => void deleteColumn(column.id)}>
                Delete column
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
        <SortableContext
          items={column.cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          <Stack gap="xs" mih={8}>
            {column.cards.map((card) => (
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
