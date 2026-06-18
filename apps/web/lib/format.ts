/** Two-letter initials for avatars, e.g. "Ada Lovelace" → "AL". */
export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

/** Due dates are stored at UTC midnight — format in UTC so the day never drifts. */
export const dueLabel = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short', day: 'numeric' });

/** `<input type="date">` wants a bare `YYYY-MM-DD`. */
export const dateInputValue = (iso: string | null): string => (iso ? iso.slice(0, 10) : '');

export function isOverdue(iso: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(iso).getTime() < today.getTime();
}

/** Compact relative time for the activity feed, e.g. "3m", "2h", "5d". */
export function relativeTime(iso: string): string {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) {
    return 'now';
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }
  return `${Math.round(hours / 24)}d`;
}
