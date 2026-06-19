'use client';

import { Alert, Badge, Button, Card, Group, Modal, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import { openPortal, startCheckout } from '@/lib/billing-api';
import type { BillingStatus, Plan } from '@/lib/types';

const TIERS: { plan: Plan; name: string; price: string; features: string[] }[] = [
  { plan: 'free', name: 'Free', price: '$0', features: ['1 board', '2 members', '1-day history'] },
  {
    plan: 'pro',
    name: 'Pro',
    price: '$19',
    features: ['3 boards', '10 members', '14-day history', 'Guest links', 'Custom labels'],
  },
  {
    plan: 'business',
    name: 'Business',
    price: '$49',
    features: ['Unlimited boards', 'Unlimited members', 'Full history'],
  },
];
const RANK: Record<Plan, number> = { free: 0, pro: 1, business: 2 };
const LABEL: Record<Plan, string> = { free: 'Free', pro: 'Pro', business: 'Business' };

interface BillingDialogProps {
  status: BillingStatus | null;
  opened: boolean;
  onClose: () => void;
}

export function BillingDialog({ status, opened, onClose }: BillingDialogProps) {
  const [busy, setBusy] = useState<Plan | null>(null);
  const [portalBusy, setPortalBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = status?.plan ?? 'free';

  const upgrade = async (plan: 'pro' | 'business'): Promise<void> => {
    setBusy(plan);
    setError(null);
    try {
      const { url } = await startCheckout(plan);
      window.location.href = url;
    } catch {
      setBusy(null);
      setError('Could not start checkout. Try again.');
    }
  };
  const manage = async (): Promise<void> => {
    setPortalBusy(true);
    setError(null);
    try {
      const { url } = await openPortal();
      window.location.href = url;
    } catch {
      setPortalBusy(false);
      setError('Could not open the billing portal. Try again.');
    }
  };

  const upgrades = TIERS.filter((tier) => RANK[tier.plan] > RANK[current]);

  return (
    <Modal opened={opened} onClose={onClose} title="Plans & billing" size="lg" centered>
      <Group align="stretch" grow gap="sm">
        {TIERS.map((tier) => (
          <Card
            key={tier.plan}
            withBorder
            radius="md"
            padding="md"
            style={{
              borderColor: tier.plan === current ? 'var(--mantine-color-violet-5)' : undefined,
            }}
          >
            <Group justify="space-between">
              <Text fw={700}>{tier.name}</Text>
              {tier.plan === current && <Badge color="violet">Current</Badge>}
            </Group>
            <Text size="xl" fw={800} mt={4}>
              {tier.price}
              <Text span size="xs" c="dimmed">
                /mo
              </Text>
            </Text>
            <Stack gap={2} mt="sm">
              {tier.features.map((feature) => (
                <Text key={feature} size="xs" c="dimmed">
                  {feature}
                </Text>
              ))}
            </Stack>
          </Card>
        ))}
      </Group>

      {error && (
        <Alert color="red" variant="light" mt="md">
          {error}
        </Alert>
      )}

      <Group justify="space-between" align="center" mt="lg" wrap="nowrap">
        <Stack gap={0}>
          <Text size="sm">
            Current plan: <b>{LABEL[current]}</b>
          </Text>
          {status?.mode === 'mock' && (
            <Text size="xs" c="dimmed">
              Demo mode — upgrades apply instantly.
            </Text>
          )}
        </Stack>
        <Group gap="xs" wrap="nowrap">
          {status?.mode === 'stripe' && current !== 'free' && (
            <Button variant="subtle" size="xs" loading={portalBusy} onClick={manage}>
              Manage billing
            </Button>
          )}
          {upgrades.map((tier) => (
            <Button
              key={tier.plan}
              size="xs"
              loading={busy === tier.plan}
              onClick={() => upgrade(tier.plan as 'pro' | 'business')}
            >
              Upgrade to {tier.name}
            </Button>
          ))}
          {upgrades.length === 0 && status?.mode !== 'stripe' && (
            <Text size="xs" c="dimmed">
              You're on the top plan.
            </Text>
          )}
        </Group>
      </Group>
    </Modal>
  );
}
