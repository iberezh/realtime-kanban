'use client';

import { Alert, Badge, Box, Center, Group, Loader, ScrollArea, Text, Title } from '@mantine/core';
import { useGuestBoard } from '@/hooks/use-guest-board';
import { useBoardStore } from '@/stores/board-store';
import { GuestColumn } from './guest-column';
import { PresenceAvatars } from './presence-avatars';

export function GuestBoard({ token }: { token: string }) {
  const { loading, error } = useGuestBoard(token);
  const view = useBoardStore((state) => state.view);
  const members = useBoardStore((state) => state.members);

  if (loading) {
    return (
      <Center h="100dvh">
        <Loader />
      </Center>
    );
  }
  if (error || !view) {
    return (
      <Center h="100dvh">
        <Alert color="red" title="Link unavailable">
          {error ?? 'This board could not be found.'}
        </Alert>
      </Center>
    );
  }

  return (
    <Box h="100dvh" display="flex" style={{ flexDirection: 'column' }}>
      <Group justify="space-between" px="lg" py="sm">
        <Group gap="sm">
          <Text fw={800} c="violet">
            Lane
          </Text>
          <Title order={3}>{view.title}</Title>
          <Badge variant="light" color="gray">
            Read-only
          </Badge>
        </Group>
        <PresenceAvatars members={members} />
      </Group>
      <ScrollArea flex={1} px="lg" pb="lg">
        <Group align="flex-start" gap="md" wrap="nowrap">
          {view.columns.map((column) => (
            <GuestColumn key={column.id} column={column} />
          ))}
        </Group>
        {view.columns.length === 0 && (
          <Text c="dimmed" size="sm" mt="md">
            This board has no columns yet.
          </Text>
        )}
      </ScrollArea>
    </Box>
  );
}
