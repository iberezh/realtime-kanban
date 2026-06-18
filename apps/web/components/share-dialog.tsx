'use client';

import {
  ActionIcon,
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
    try {
      const link = await createShareLink(boardId);
      setLinks((prev) => [link, ...prev]);
    } finally {
      setBusy(false);
    }
  };
  const revoke = async (id: string): Promise<void> => {
    await revokeShareLink(id).catch(() => undefined);
    setLinks((prev) => prev.filter((link) => link.id !== id));
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
