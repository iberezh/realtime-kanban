'use client';

import { Anchor, Button, Divider, Group, Title } from '@mantine/core';
import Link from 'next/link';
import type { Member } from '@/lib/types';
import { Brand } from './brand';
import { PresenceAvatars } from './presence-avatars';

interface BoardHeaderProps {
  title: string;
  members: Member[];
  onOpenLabels: () => void;
  onOpenActivity: () => void;
  onOpenShare: () => void;
}

export function BoardHeader({
  title,
  members,
  onOpenLabels,
  onOpenActivity,
  onOpenShare,
}: BoardHeaderProps) {
  return (
    <Group justify="space-between" px="lg" py="sm">
      <Group gap="md">
        <Brand size={24} href="/app" />
        <Divider orientation="vertical" />
        <Anchor component={Link} href="/app" size="sm" c="dimmed">
          ← boards
        </Anchor>
        <Title order={3}>{title}</Title>
      </Group>
      <Group gap="sm">
        <Button variant="subtle" size="xs" onClick={onOpenLabels}>
          Labels
        </Button>
        <Button variant="subtle" size="xs" onClick={onOpenActivity}>
          Activity
        </Button>
        <Button size="xs" onClick={onOpenShare}>
          Share
        </Button>
        <PresenceAvatars members={members} />
      </Group>
    </Group>
  );
}
