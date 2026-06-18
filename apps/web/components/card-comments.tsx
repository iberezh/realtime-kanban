'use client';

import { ActionIcon, Avatar, Box, Group, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { addComment, deleteComment, listComments } from '@/lib/comment-api';
import { initials, relativeTime } from '@/lib/format';
import { getSocket } from '@/lib/socket';
import type { CommentEvent, CommentView } from '@/lib/types';
import { useSessionStore } from '@/stores/session-store';
import { CommentComposer } from './comment-composer';

const byCreatedAt = (a: CommentView, b: CommentView): number =>
  a.createdAt < b.createdAt ? -1 : 1;

function isCommentEvent(value: unknown): value is CommentEvent {
  const type = (value as { type?: unknown }).type;
  return type === 'comment.created' || type === 'comment.deleted';
}

/** Live comment thread for a card: loads on open and follows the board room's comment events. */
export function CardComments({ cardId }: { cardId: string }) {
  const userId = useSessionStore((state) => state.profile?.user.id);
  const [comments, setComments] = useState<CommentView[]>([]);

  useEffect(() => {
    let active = true;
    listComments(cardId).then(
      (list) => active && setComments(list),
      () => undefined,
    );

    const socket = getSocket();
    const onEvent = (event: unknown): void => {
      if (!isCommentEvent(event) || event.cardId !== cardId) {
        return;
      }
      if (event.type === 'comment.created') {
        setComments((prev) => [...prev.filter((c) => c.id !== event.comment.id), event.comment]);
      } else {
        setComments((prev) => prev.filter((c) => c.id !== event.commentId));
      }
    };
    socket.on('board:event', onEvent);
    return () => {
      active = false;
      socket.off('board:event', onEvent);
    };
  }, [cardId]);

  // The created comment echoes back over the socket, which appends it.
  const post = (body: string, mentionedUserIds: string[]): Promise<void> =>
    addComment(cardId, body, mentionedUserIds).then(() => undefined);

  return (
    <Stack gap="sm">
      <Text size="sm" fw={500}>
        Comments
      </Text>
      {[...comments].sort(byCreatedAt).map((comment) => (
        <Group key={comment.id} gap="xs" align="flex-start" wrap="nowrap">
          <Avatar
            size="sm"
            radius="xl"
            styles={{ placeholder: { background: comment.authorColor, color: '#fff' } }}
          >
            {initials(comment.authorName)}
          </Avatar>
          <Box flex={1}>
            <Group gap={6}>
              <Text size="sm" fw={600}>
                {comment.authorName}
              </Text>
              <Text size="xs" c="dimmed">
                {relativeTime(comment.createdAt)}
              </Text>
            </Group>
            <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
              {comment.body}
            </Text>
          </Box>
          {comment.authorId === userId && (
            <ActionIcon
              size="sm"
              variant="subtle"
              color="red"
              aria-label="Delete comment"
              onClick={() => void deleteComment(comment.id).catch(() => undefined)}
            >
              ×
            </ActionIcon>
          )}
        </Group>
      ))}
      <CommentComposer onSubmit={post} />
    </Stack>
  );
}
