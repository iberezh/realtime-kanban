'use client';

import { Alert, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useEffect, useState } from 'react';
import { startCheckout } from '@/lib/billing-api';
import { createShareLink, listShareLinks, revokeShareLink, rotateShareLink } from '@/lib/share-api';
import type { ShareLink } from '@/lib/types';
import { ShareLinkRow } from './share-link-row';

const today = (): string => new Date().toISOString().slice(0, 10);

interface ShareDialogProps {
  boardId: string;
  opened: boolean;
  onClose: () => void;
}

export function ShareDialog({ boardId, opened, onClose }: ShareDialogProps) {
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [expiry, setExpiry] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradeable, setUpgradeable] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (!opened) {
      return;
    }
    let active = true;
    listShareLinks(boardId).then(
      (next) => active && setLinks(next),
      () => undefined,
    );
    return () => {
      active = false;
    };
  }, [opened, boardId]);

  const create = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    setUpgradeable(false);
    try {
      const link = await createShareLink(boardId, expiry ? `${expiry}T23:59:59.999Z` : null);
      setLinks((prev) => [link, ...prev]);
      setExpiry(null);
    } catch (err) {
      // Surface the server's real reason (e.g. the Pro-gate) instead of a generic message.
      const message =
        err instanceof Error ? err.message : 'Could not create a share link. Try again.';
      setError(message);
      setUpgradeable(/pro feature|upgrade/i.test(message));
    } finally {
      setBusy(false);
    }
  };

  const upgrade = async (): Promise<void> => {
    setUpgrading(true);
    try {
      const { url } = await startCheckout('pro');
      window.location.href = url;
    } catch {
      setUpgrading(false);
      setError('Could not start checkout. Try again.');
    }
  };
  // Only drop the link from the UI once the server confirms it is gone.
  const revoke = async (id: string): Promise<void> => {
    try {
      await revokeShareLink(id);
      setLinks((prev) => prev.filter((link) => link.id !== id));
    } catch {
      setError('Could not revoke that link — it may still be active.');
    }
  };
  // Swap in the rotated link (new token) once the server returns it.
  const rotate = async (id: string): Promise<void> => {
    setError(null);
    try {
      const rotated = await rotateShareLink(id);
      setLinks((prev) => prev.map((link) => (link.id === id ? rotated : link)));
    } catch {
      setError('Could not rotate that link. Try again.');
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Share this board" centered>
      <Stack gap="sm">
        <Text size="sm" c="dimmed">
          Anyone with a link watches this board live — read-only, no account needed.
        </Text>
        <Group align="flex-end" gap="xs" wrap="nowrap">
          <DatePickerInput
            flex={1}
            size="xs"
            label="Link expires"
            placeholder="Never"
            clearable
            minDate={today()}
            valueFormat="MMM D, YYYY"
            value={expiry}
            onChange={setExpiry}
          />
          <Button onClick={create} loading={busy}>
            Create link
          </Button>
        </Group>
        {error && (
          <Alert color={upgradeable ? 'violet' : 'red'} variant="light">
            <Stack gap="xs" align="flex-start">
              <Text size="sm">{error}</Text>
              {upgradeable && (
                <Button size="xs" loading={upgrading} onClick={upgrade}>
                  Upgrade to Pro
                </Button>
              )}
            </Stack>
          </Alert>
        )}
        {links.length === 0 ? (
          <Text size="xs" c="dimmed">
            No active links yet.
          </Text>
        ) : (
          links.map((link) => (
            <ShareLinkRow key={link.id} link={link} onRotate={rotate} onRevoke={revoke} />
          ))
        )}
      </Stack>
    </Modal>
  );
}
