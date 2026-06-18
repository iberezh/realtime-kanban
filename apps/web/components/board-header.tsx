'use client';

import { Anchor, Group, Title } from '@mantine/core';
import Link from 'next/link';
import type { Member } from '@/lib/types';
import { PresenceAvatars } from './presence-avatars';

interface BoardHeaderProps {
  title: string;
  members: Member[];
}

export function BoardHeader({ title, members }: BoardHeaderProps) {
  return (
    <Group justify="space-between" px="lg" py="sm">
      <Group gap="md">
        <Anchor component={Link} href="/app" size="sm" c="dimmed">
          ← boards
        </Anchor>
        <Title order={3}>{title}</Title>
      </Group>
      <PresenceAvatars members={members} />
    </Group>
  );
}
