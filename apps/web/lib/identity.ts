import type { Identity } from './types';

const STORAGE_KEY = 'kanban-identity';

/** Mantine palette accents — one becomes the member's presence color. */
export const MEMBER_COLORS = [
  '#e64980',
  '#be4bdb',
  '#7950f2',
  '#4c6ef5',
  '#228be6',
  '#15aabf',
  '#12b886',
  '#fa5252',
  '#fd7e14',
  '#40c057',
] as const;

export function loadIdentity(): Identity | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<Identity>;
    return parsed.name && parsed.color ? { name: parsed.name, color: parsed.color } : null;
  } catch {
    return null;
  }
}

export function saveIdentity(identity: Identity): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
}
