'use client';

import { Avatar, Drawer, Group, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { activityVerb } from '@/lib/activity-verbs';
import { initials, relativeTime } from '@/lib/format';
import type { ActivityEntry } from '@/lib/types';
import { listActivity } from '@/lib/workspace-api';
import { useBoardStore } from '@/stores/board-store';

interface ActivityFeedProps {
  boardId: string;
  opened: boolean;
  onClose: () => void;
}

/** Right-hand drawer of recent board activity; refetched each time it opens. */
export function ActivityFeed({ boardId, opened, onClose }: ActivityFeedProps) {
  const members = useBoardStore((state) => state.accountMembers);
  const [entries, setEntries] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    if (!opened) {
      return;
    }
    let active = true;
    listActivity(boardId).then(
      (data) => active && setEntries(data),
      () => undefined,
    );
    return () => {
      active = false;
    };
  }, [opened, boardId]);

  const nameOf = (actorId: string | null): string =>
    members.find((member) => member.userId === actorId)?.name ?? 'Someone';

  return (
    <Drawer opened={opened} onClose={onClose} position="right" title="Activity" size="sm">
      <Stack gap="sm">
        {entries.length === 0 ? (
          <Text size="sm" c="dimmed">
            No activity yet.
          </Text>
        ) : (
          entries.map((entry) => (
            <Group key={entry.id} gap="xs" wrap="nowrap" align="flex-start">
              <Avatar
                size="sm"
                radius="xl"
                styles={{
                  placeholder: {
                    background: members.find((m) => m.userId === entry.actorId)?.color ?? '#adb5bd',
                    color: '#fff',
                  },
                }}
              >
                {initials(nameOf(entry.actorId))}
              </Avatar>
              <Text size="sm" flex={1}>
                <Text span fw={600}>
                  {nameOf(entry.actorId)}
                </Text>{' '}
                {activityVerb(entry.type)}
              </Text>
              <Text size="xs" c="dimmed">
                {relativeTime(entry.createdAt)}
              </Text>
            </Group>
          ))
        )}
      </Stack>
    </Drawer>
  );
}
