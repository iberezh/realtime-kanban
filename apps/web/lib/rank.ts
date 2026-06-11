/**
 * Client-side copy of the server's fractional ranking (apps/api/src/kanban/ranking/rank.ts).
 * Both sides computing the same deterministic rank from the same neighbours is
 * what makes optimistic drag-and-drop cheap: the predicted state usually equals
 * the state the server broadcasts back, so reconciliation is a visual no-op.
 */
const DIGITS = 'abcdefghijklmnopqrstuvwxyz';

export function rankBetween(prev: string | null, next: string | null): string {
  if (prev !== null && next !== null && prev >= next) {
    throw new RangeError(`rankBetween: "${prev}" must sort before "${next}"`);
  }
  return midpoint(prev ?? '', next);
}

function midpoint(a: string, b: string | null): string {
  if (b !== null) {
    let prefix = 0;
    while (prefix < b.length && a.charAt(prefix) === b.charAt(prefix)) {
      prefix += 1;
    }
    if (prefix > 0) {
      return b.slice(0, prefix) + midpoint(a.slice(prefix), b.slice(prefix));
    }
  }

  const digitA = a === '' ? -1 : DIGITS.indexOf(a.charAt(0));
  const digitB = b === null || b === '' ? DIGITS.length : DIGITS.indexOf(b.charAt(0));

  const mid = Math.round((digitA + digitB) / 2);
  if (digitB - digitA > 1 && mid > 0) {
    return DIGITS.charAt(mid);
  }

  if (digitA >= 0) {
    return DIGITS.charAt(digitA) + midpoint(a.slice(1), null);
  }
  if (digitB === 0 && b !== null) {
    return DIGITS.charAt(0) + midpoint('', b.slice(1));
  }
  return DIGITS.charAt(0) + midpoint('', null);
}
