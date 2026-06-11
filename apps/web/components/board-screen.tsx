'use client';

import { Alert, Box, Center, Group, Loader, ScrollArea, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useBoard } from '@/hooks/use-board';
import { createColumn } from '@/lib/api';
import { loadIdentity, saveIdentity } from '@/lib/identity';
import type { Card, Identity } from '@/lib/types';
import { useBoardStore } from '@/stores/board-store';
import { BoardHeader } from './board-header';
import { CardModal } from './card-modal';
import { ColumnView } from './column-view';
import { InlineAdd } from './inline-add';
import { JoinForm } from './join-form';

export function BoardScreen({ boardId }: { boardId: string }) {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [ready, setReady] = useState(false);
  const [openCard, setOpenCard] = useState<Card | null>(null);
  const { view, members, deleted, error } = useBoardStore();
  useBoard(boardId, identity);

  useEffect(() => {
    setIdentity(loadIdentity());
    setReady(true);
  }, []);

  if (!ready) {
    return null;
  }
  if (!identity) {
    return (
      <JoinForm
        onJoin={(value) => {
          saveIdentity(value);
          setIdentity(value);
        }}
      />
    );
  }
  if (deleted) {
    return (
      <Center h="100dvh">
        <Alert color="red" title="This board was deleted">
          Someone removed it while you were here.
        </Alert>
      </Center>
    );
  }
  if (error) {
    return (
      <Center h="100dvh">
        <Alert color="red" title="Could not load the board">
          {error}
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
      <ScrollArea flex={1} px="lg" pb="lg">
        <Group align="flex-start" gap="md" wrap="nowrap">
          {view.columns.map((column) => (
            <ColumnView key={column.id} column={column} onOpenCard={setOpenCard} />
          ))}
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
      {openCard && <CardModal card={openCard} onClose={() => setOpenCard(null)} />}
    </Box>
  );
}
