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
            <Stack gap={2} mt="sm" mb="md">
              {tier.features.map((feature) => (
                <Text key={feature} size="xs" c="dimmed">
                  {feature}
                </Text>
              ))}
            </Stack>
            {RANK[tier.plan] > RANK[current] ? (
              <Button
                fullWidth
                size="xs"
                loading={busy === tier.plan}
                onClick={() => upgrade(tier.plan as 'pro' | 'business')}
              >
                Upgrade
              </Button>
            ) : (
              <Button fullWidth size="xs" variant="default" disabled>
                {tier.plan === current ? 'Current plan' : 'Included'}
              </Button>
            )}
          </Card>
        ))}
      </Group>
      {error && (
        <Alert color="red" variant="light" mt="md">
          {error}
        </Alert>
      )}
      {status?.mode === 'stripe' && current !== 'free' && (
        <Button variant="subtle" size="xs" mt="md" loading={portalBusy} onClick={manage}>
          Manage billing
        </Button>
      )}
      {status?.mode === 'mock' && (
        <Text size="xs" c="dimmed" mt="md">
          Demo mode — upgrades apply instantly, no payment needed.
        </Text>
      )}
    </Modal>
  );
}
