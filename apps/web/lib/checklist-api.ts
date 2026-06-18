import { api, ENDPOINTS } from './api';
import type { ChecklistItem } from './types';

export const addChecklistItem = (cardId: string, text: string): Promise<ChecklistItem> =>
  api(ENDPOINTS.cardChecklist(cardId), { method: 'POST', body: JSON.stringify({ text }) });

export const updateChecklistItem = (
  id: string,
  patch: { text?: string; done?: boolean },
): Promise<ChecklistItem> =>
  api(ENDPOINTS.checklistItem(id), { method: 'PATCH', body: JSON.stringify(patch) });

export const deleteChecklistItem = (id: string): Promise<void> =>
  api(ENDPOINTS.checklistItem(id), { method: 'DELETE' });
