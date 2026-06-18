'use client';

import { Icon } from '@iconify/react';
import { ActionIcon, Indicator, Menu, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { relativeTime } from '@/lib/format';
import { listNotifications, markAllRead, unreadCount } from '@/lib/notification-api';
import type { AppNotification } from '@/lib/types';

export function NotificationsBell() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    let active = true;
    unreadCount().then(
      (result) => active && setCount(result.count),
      () => undefined,
    );
    return () => {
      active = false;
    };
  }, []);

  const onOpen = (): void => {
    listNotifications().then(setItems, () => undefined);
    if (count > 0) {
      void markAllRead().then(
        () => setCount(0),
        () => undefined,
      );
    }
  };

  return (
    <Menu position="bottom-end" withArrow width={300} onOpen={onOpen}>
      <Menu.Target>
        <Indicator disabled={count === 0} label={count} size={16} color="pink" offset={4}>
          <ActionIcon variant="subtle" color="gray" aria-label="Notifications">
            <Icon icon="solar:bell-bold-duotone" width={20} />
          </ActionIcon>
        </Indicator>
      </Menu.Target>
      <Menu.Dropdown>
        {items.length === 0 ? (
          <Text size="sm" c="dimmed" p="sm">
            No notifications yet.
          </Text>
        ) : (
          items.map((item) => (
            <Menu.Item key={item.id}>
              <Stack gap={2}>
                <Text size="sm">
                  <Text span fw={600}>
                    {item.data.actorName ?? 'Someone'}
                  </Text>{' '}
                  mentioned you
                </Text>
                {item.data.snippet && (
                  <Text size="xs" c="dimmed" lineClamp={2}>
                    {item.data.snippet}
                  </Text>
                )}
                <Text size="xs" c="dimmed">
                  {relativeTime(item.createdAt)}
                </Text>
              </Stack>
            </Menu.Item>
          ))
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
