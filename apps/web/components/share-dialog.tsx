'use client';

import {
  ActionIcon,
  Alert,
  Button,
  CopyButton,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { createShareLink, listShareLinks, revokeShareLink } from '@/lib/share-api';
import type { ShareLink } from '@/lib/types';

const shareUrl = (token: string): string =>
  typeof window === 'undefined' ? '' : `${window.location.origin}/share/${token}`;

interface ShareDialogProps {
  boardId: string;
  opened: boolean;
  onClose: () => void;
}

export function ShareDialog({ boardId, opened, onClose }: ShareDialogProps) {
  const [links, setLinks] = useState<ShareLink[]>([]);
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
      const link = await createShareLink(boardId);
      setLinks((prev) => [link, ...prev]);
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

  return (
    <Modal opened={opened} onClose={onClose} title="Share this board" centered>
      <Stack gap="sm">
        <Text size="sm" c="dimmed">
          Anyone with a link watches this board live — read-only, no account needed.
        </Text>
        <Button onClick={create} loading={busy}>
          Create share link
        </Button>
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
            <Group key={link.id} gap="xs" wrap="nowrap">
              <TextInput flex={1} readOnly size="xs" value={shareUrl(link.token)} />
              <CopyButton value={shareUrl(link.token)}>
                {({ copied, copy }) => (
                  <Button
                    size="xs"
                    variant="light"
                    color={copied ? 'teal' : 'violet'}
                    onClick={copy}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                )}
              </CopyButton>
              <ActionIcon
                variant="subtle"
                color="red"
                aria-label="Revoke link"
                onClick={() => revoke(link.id)}
              >
                ×
              </ActionIcon>
            </Group>
          ))
        )}
      </Stack>
    </Modal>
  );
}
