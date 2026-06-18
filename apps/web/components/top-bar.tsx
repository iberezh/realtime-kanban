'use client';

import { Anchor, Button, Group, Text } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/api';
import { useSessionStore } from '@/stores/session-store';
import { BillingButton } from './billing-button';
import { NotificationsBell } from './notifications-bell';

export function TopBar() {
  const router = useRouter();
  const { profile, clearProfile } = useSessionStore();

  const handleLogout = async (): Promise<void> => {
    await logout().catch(() => undefined);
    clearProfile();
    router.replace('/login');
  };

  return (
    <Group
      justify="space-between"
      px="lg"
      py="sm"
      style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
    >
      <Anchor component={Link} href="/app" fw={600} c="inherit" underline="never" size="sm">
        Lane
      </Anchor>
      <Group gap="md">
        <NotificationsBell />
        <BillingButton />
        {profile && (
          <Text size="sm" c="dimmed">
            {profile.user.name}
          </Text>
        )}
        <Button variant="subtle" size="xs" onClick={() => void handleLogout()}>
          Log out
        </Button>
      </Group>
    </Group>
  );
}
