'use client';

import { Badge, Button, Group } from '@mantine/core';
import { useEffect, useState } from 'react';
import { getBillingStatus } from '@/lib/billing-api';
import type { BillingStatus } from '@/lib/types';
import { BillingDialog } from './billing-dialog';

const LABEL: Record<string, string> = { free: 'Free', pro: 'Pro', business: 'Business' };

/** TopBar entry: shows the current plan and opens the plans dialog. */
export function BillingButton() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    getBillingStatus().then(
      (next) => active && setStatus(next),
      () => undefined,
    );
    return () => {
      active = false;
    };
  }, []);

  const paid = status !== null && status.plan !== 'free';

  return (
    <>
      <Group gap={6}>
        {status && (
          <Badge variant="light" color={paid ? 'violet' : 'gray'}>
            {LABEL[status.plan]}
          </Badge>
        )}
        <Button size="xs" variant={paid ? 'subtle' : 'filled'} onClick={() => setOpen(true)}>
          {paid ? 'Billing' : 'Upgrade'}
        </Button>
      </Group>
      <BillingDialog status={status} opened={open} onClose={() => setOpen(false)} />
    </>
  );
}
