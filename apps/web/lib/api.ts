import type { Board, BoardView, Card, Column, PublicProfile } from './types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

/** Every REST path in one place — the only spot that knows the URL shapes. */
export const ENDPOINTS = {
  // Auth
  authSignup: '/auth/signup',
  authLogin: '/auth/login',
  authLogout: '/auth/logout',
  authMe: '/auth/me',
  // Boards
  boards: '/boards',
  board: (boardId: string) => `/boards/${boardId}`,
  boardColumns: (boardId: string) => `/boards/${boardId}/columns`,
  column: (columnId: string) => `/columns/${columnId}`,
  columnMove: (columnId: string) => `/columns/${columnId}/move`,
  columnCards: (columnId: string) => `/columns/${columnId}/cards`,
  card: (cardId: string) => `/cards/${cardId}`,
  cardMove: (cardId: string) => `/cards/${cardId}/move`,
} as const;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `Request failed: ${response.status}`);
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

// Auth
export interface SignupPayload {
  email: string;
  password: string;
  name: string;
  accountName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const signup = (payload: SignupPayload): Promise<PublicProfile> =>
  api(ENDPOINTS.authSignup, { method: 'POST', body: JSON.stringify(payload) });

export const login = (payload: LoginPayload): Promise<PublicProfile> =>
  api(ENDPOINTS.authLogin, { method: 'POST', body: JSON.stringify(payload) });

export const logout = (): Promise<void> => api(ENDPOINTS.authLogout, { method: 'POST' });

export const getMe = (): Promise<PublicProfile> => api(ENDPOINTS.authMe);

// Boards
export const listBoards = (): Promise<Board[]> => api(ENDPOINTS.boards);

export const createBoard = (title: string): Promise<Board> =>
  api(ENDPOINTS.boards, { method: 'POST', body: JSON.stringify({ title }) });

export const getBoard = (boardId: string): Promise<BoardView> => api(ENDPOINTS.board(boardId));

export const createColumn = (boardId: string, title: string): Promise<Column> =>
  api(ENDPOINTS.boardColumns(boardId), { method: 'POST', body: JSON.stringify({ title }) });

export const renameColumn = (columnId: string, title: string): Promise<Column> =>
  api(ENDPOINTS.column(columnId), { method: 'PATCH', body: JSON.stringify({ title }) });

export const deleteColumn = (columnId: string): Promise<void> =>
  api(ENDPOINTS.column(columnId), { method: 'DELETE' });

export const createCard = (columnId: string, title: string, description?: string): Promise<Card> =>
  api(ENDPOINTS.columnCards(columnId), {
    method: 'POST',
    body: JSON.stringify({ title, ...(description ? { description } : {}) }),
  });

export const updateCard = (
  cardId: string,
  patch: { title?: string; description?: string },
): Promise<Card> => api(ENDPOINTS.card(cardId), { method: 'PATCH', body: JSON.stringify(patch) });

export const deleteCard = (cardId: string): Promise<void> =>
  api(ENDPOINTS.card(cardId), { method: 'DELETE' });

export const moveCard = (
  cardId: string,
  toColumnId: string,
  beforeCardId?: string,
): Promise<Card> =>
  api(ENDPOINTS.cardMove(cardId), {
    method: 'POST',
    body: JSON.stringify({ toColumnId, ...(beforeCardId ? { beforeCardId } : {}) }),
  });
