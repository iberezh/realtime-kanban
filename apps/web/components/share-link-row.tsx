'use client';

import { ActionIcon, Button, CopyButton, Group, Stack, Text, TextInput } from '@mantine/core';
import type { ShareLink } from '@/lib/types';

const shareUrl = (token: string): string =>
  typeof window === 'undefined' ? '' : `${window.location.origin}/share/${token}`;

function expiryLabel(link: ShareLink): string {
  if (!link.expiresAt) {
    return 'Never expires';
  }
  const when = new Date(link.expiresAt);
  if (when.getTime() < Date.now()) {
    return 'Expired';
  }
  return `Expires ${when.toLocaleDateString('en-US', { dateStyle: 'medium' })}`;
}

interface ShareLinkRowProps {
  link: ShareLink;
  onRotate: (id: string) => void;
  onRevoke: (id: string) => void;
}

/** One share link: its URL, copy/rotate/revoke actions, and expiry caption. */
export function ShareLinkRow({ link, onRotate, onRevoke }: ShareLinkRowProps) {
  const url = shareUrl(link.token);
  return (
    <Stack gap={2}>
      <Group gap="xs" wrap="nowrap">
        <TextInput flex={1} readOnly size="xs" value={url} />
        <CopyButton value={url}>
          {({ copied, copy }) => (
            <Button size="xs" variant="light" color={copied ? 'teal' : 'violet'} onClick={copy}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
          )}
        </CopyButton>
        <ActionIcon
          variant="subtle"
          color="violet"
          aria-label="Rotate link"
          title="Issue a new link and disable this one"
          onClick={() => onRotate(link.id)}
        >
          ↻
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="red"
          aria-label="Revoke link"
          onClick={() => onRevoke(link.id)}
        >
          ×
        </ActionIcon>
      </Group>
      <Text size="xs" c="dimmed">
        {expiryLabel(link)}
      </Text>
    </Stack>
  );
}
