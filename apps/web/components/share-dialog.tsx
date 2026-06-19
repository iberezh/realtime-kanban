'use client';

import { Alert, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useEffect, useState } from 'react';
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
    try {
      const link = await createShareLink(boardId, expiry ? `${expiry}T23:59:59.999Z` : null);
      setLinks((prev) => [link, ...prev]);
      setExpiry(null);
    } catch {
      setError('Could not create a share link. Try again.');
    } finally {
      setBusy(false);
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
          <Alert color="red" variant="light">
            {error}
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
