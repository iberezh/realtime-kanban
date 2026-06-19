'use client';

import { Badge, Button, Group } from '@mantine/core';
import { useEffect, useState } from 'react';
import { confirmCheckout, getBillingStatus } from '@/lib/billing-api';
import type { BillingStatus } from '@/lib/types';
import { BillingDialog } from './billing-dialog';

const LABEL: Record<string, string> = { free: 'Free', pro: 'Pro', business: 'Business' };

/** TopBar entry: shows the current plan and opens the plans dialog. */
export function BillingButton() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    // On return from Stripe Checkout, sync the plan from the session before the webhook lands.
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (params.has('billing')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    const load = sessionId ? confirmCheckout(sessionId) : getBillingStatus();
    load.then(
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
