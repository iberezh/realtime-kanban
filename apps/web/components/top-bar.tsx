'use client';

import { Button, Group, Text } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/api';
import { useSessionStore } from '@/stores/session-store';
import { BillingButton } from './billing-button';
import { Brand } from './brand';
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
      <Brand size={26} href="/app" />
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
