import { api, ENDPOINTS } from './api';
import type { AccountMember, ActivityEntry, Label } from './types';

// Labels
export const listLabels = (): Promise<Label[]> => api(ENDPOINTS.labels);

export const createLabel = (name: string, color: string): Promise<Label> =>
  api(ENDPOINTS.labels, { method: 'POST', body: JSON.stringify({ name, color }) });

export const renameLabel = (labelId: string, name: string): Promise<Label> =>
  api(ENDPOINTS.label(labelId), { method: 'PATCH', body: JSON.stringify({ name }) });

export const deleteLabel = (labelId: string): Promise<void> =>
  api(ENDPOINTS.label(labelId), { method: 'DELETE' });

// Members
export const listMembers = (): Promise<AccountMember[]> => api(ENDPOINTS.members);

// Activity
export const listActivity = (boardId: string): Promise<ActivityEntry[]> =>
  api(ENDPOINTS.boardActivity(boardId));
