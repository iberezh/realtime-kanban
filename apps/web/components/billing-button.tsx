'use client';

import { Badge, Button, Group } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { confirmCheckout, getBillingStatus } from '@/lib/billing-api';
import type { BillingStatus } from '@/lib/types';
import { BillingDialog } from './billing-dialog';

const LABEL: Record<string, string> = { free: 'Free', pro: 'Pro', business: 'Business' };

/** TopBar entry: shows the current plan and opens the plans dialog. */
export function BillingButton() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [open, setOpen] = useState(false);
  // Run once: under React Strict Mode the second invocation would read session_id after
  // the first cleared it, race getBillingStatus ahead of the confirm write, and show 'free'.
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) {
      return;
    }
    loaded.current = true;
    // On return from Stripe Checkout, sync the plan from the session before the webhook lands.
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (params.has('billing')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    const load = sessionId ? confirmCheckout(sessionId) : getBillingStatus();
    load.then(setStatus, () => undefined);
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
