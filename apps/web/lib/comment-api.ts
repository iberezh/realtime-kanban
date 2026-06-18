import { api, ENDPOINTS } from './api';
import type { CommentView } from './types';

export const listComments = (cardId: string): Promise<CommentView[]> =>
  api(ENDPOINTS.cardComments(cardId));

export const addComment = (
  cardId: string,
  body: string,
  mentionedUserIds: string[],
): Promise<CommentView> =>
  api(ENDPOINTS.cardComments(cardId), {
    method: 'POST',
    body: JSON.stringify({ body, mentionedUserIds }),
  });

export const deleteComment = (id: string): Promise<void> =>
  api(ENDPOINTS.comment(id), { method: 'DELETE' });
