import type { Board, BoardView, Card, Column } from './types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `Request failed: ${response.status}`);
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

export const listBoards = (): Promise<Board[]> => api('/boards');

export const createBoard = (title: string): Promise<Board> =>
  api('/boards', { method: 'POST', body: JSON.stringify({ title }) });

export const getBoard = (boardId: string): Promise<BoardView> => api(`/boards/${boardId}`);

export const createColumn = (boardId: string, title: string): Promise<Column> =>
  api(`/boards/${boardId}/columns`, { method: 'POST', body: JSON.stringify({ title }) });

export const renameColumn = (columnId: string, title: string): Promise<Column> =>
  api(`/columns/${columnId}`, { method: 'PATCH', body: JSON.stringify({ title }) });

export const deleteColumn = (columnId: string): Promise<void> =>
  api(`/columns/${columnId}`, { method: 'DELETE' });

export const createCard = (columnId: string, title: string, description?: string): Promise<Card> =>
  api(`/columns/${columnId}/cards`, {
    method: 'POST',
    body: JSON.stringify({ title, ...(description ? { description } : {}) }),
  });

export const updateCard = (
  cardId: string,
  patch: { title?: string; description?: string },
): Promise<Card> => api(`/cards/${cardId}`, { method: 'PATCH', body: JSON.stringify(patch) });

export const deleteCard = (cardId: string): Promise<void> =>
  api(`/cards/${cardId}`, { method: 'DELETE' });

export const moveCard = (
  cardId: string,
  toColumnId: string,
  beforeCardId?: string,
): Promise<Card> =>
  api(`/cards/${cardId}/move`, {
    method: 'POST',
    body: JSON.stringify({ toColumnId, ...(beforeCardId ? { beforeCardId } : {}) }),
  });
