import { api, ENDPOINTS } from './api';
import type { SharedBoardView, ShareLink } from './types';

export const listShareLinks = (boardId: string): Promise<ShareLink[]> =>
  api(ENDPOINTS.boardShareLinks(boardId));

export const createShareLink = (boardId: string): Promise<ShareLink> =>
  api(ENDPOINTS.boardShareLinks(boardId), { method: 'POST' });

export const revokeShareLink = (id: string): Promise<void> =>
  api(ENDPOINTS.shareLink(id), { method: 'DELETE' });

/** Public — no session required; the token is the credential. */
export const resolveShareLink = (token: string): Promise<SharedBoardView> =>
  api(ENDPOINTS.resolveShare(token));
