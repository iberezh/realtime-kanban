'use client';

import { closestCorners, DndContext, DragOverlay } from '@dnd-kit/core';
import { horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { Alert, Box, Center, Group, Loader, ScrollArea, Text } from '@mantine/core';
import { useState } from 'react';
import { useBoard } from '@/hooks/use-board';
import { useBoardDnd } from '@/hooks/use-board-dnd';
import { createColumn } from '@/lib/api';
import type { Card, Identity } from '@/lib/types';
import { useBoardStore } from '@/stores/board-store';
import { useSessionStore } from '@/stores/session-store';
import { BoardHeader } from './board-header';
import { CardItem } from './card-item';
import { CardModal } from './card-modal';
import { ColumnView } from './column-view';
import { InlineAdd } from './inline-add';

interface BoardScreenProps {
  boardId: string;
}

export function BoardScreen({ boardId }: BoardScreenProps) {
  const [openCard, setOpenCard] = useState<Card | null>(null);
  const { view, members, deleted, error } = useBoardStore();
  const profile = useSessionStore((s) => s.profile);

  const identity: Identity | null = profile
    ? { name: profile.user.name, color: profile.user.color }
    : null;

  const { sensors, dragging, onDragStart, onDragEnd } = useBoardDnd(boardId);
  useBoard(boardId, identity);

  if (deleted || error) {
    return (
      <Center h="100dvh">
        <Alert color="red" title={deleted ? 'This board was deleted' : 'Could not load the board'}>
          {deleted ? 'Someone removed it while you were here.' : error}
        </Alert>
      </Center>
    );
  }
  if (!view) {
    return (
      <Center h="100dvh">
        <Loader />
      </Center>
    );
  }

  return (
    <Box h="100dvh" display="flex" style={{ flexDirection: 'column' }}>
      <BoardHeader title={view.title} members={members} />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <ScrollArea flex={1} px="lg" pb="lg">
          <Group align="flex-start" gap="md" wrap="nowrap">
            <SortableContext
              items={view.columns.map((column) => column.id)}
              strategy={horizontalListSortingStrategy}
            >
              {view.columns.map((column) => (
                <ColumnView key={column.id} column={column} onOpenCard={setOpenCard} />
              ))}
            </SortableContext>
            <Box w={290} miw={290}>
              <InlineAdd
                placeholder="Add a column"
                onAdd={async (title) => {
                  await createColumn(boardId, title);
                }}
              />
            </Box>
          </Group>
          {view.columns.length === 0 && (
            <Text c="dimmed" size="sm" mt="md">
              No columns yet — add the first one.
            </Text>
          )}
        </ScrollArea>
        <DragOverlay>
          {dragging.card && <CardItem card={dragging.card} onOpen={() => undefined} />}
        </DragOverlay>
      </DndContext>
      {openCard && <CardModal card={openCard} onClose={() => setOpenCard(null)} />}
    </Box>
  );
}
