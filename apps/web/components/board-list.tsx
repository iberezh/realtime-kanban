'use client';

import { Alert, Card as MantineCard, SimpleGrid, Skeleton, Text } from '@mantine/core';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createBoard, listBoards } from '@/lib/api';
import type { Board } from '@/lib/types';
import { InlineAdd } from './inline-add';

export function BoardList() {
  const [boards, setBoards] = useState<Board[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listBoards()
      .then((items) => active && setBoards(items))
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'Failed to load boards');
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <Alert color="red" title="API unreachable">
        {error} — is the API running on port 4000?
      </Alert>
    );
  }
  if (!boards) {
    return <Skeleton height={120} radius="md" />;
  }

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} mb="lg">
        {boards.map((board) => (
          <MantineCard
            key={board.id}
            component={Link}
            href={`/app/board/${board.id}`}
            withBorder
            radius="md"
            padding="lg"
          >
            <Text fw={600}>{board.title}</Text>
            <Text size="xs" c="dimmed" mt={4}>
              created {new Date(board.createdAt).toLocaleDateString()}
            </Text>
          </MantineCard>
        ))}
      </SimpleGrid>
      {boards.length === 0 && (
        <Text c="dimmed" size="sm" mb="md">
          No boards yet — create the first one.
        </Text>
      )}
      <InlineAdd
        placeholder="New board name"
        onAdd={async (title) => {
          const board = await createBoard(title);
          setBoards((current) => [...(current ?? []), board]);
        }}
      />
    </>
  );
}
