import { randomBytes } from 'node:crypto';

/** An unguessable, URL-safe token — the only credential a guest needs to view a board. */
export function generateShareToken(): string {
  return randomBytes(18).toString('base64url');
}
