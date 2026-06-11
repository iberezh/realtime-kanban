/**
 * Fractional ranking keys over the alphabet a-z ('a' acts as zero).
 * `rankBetween` returns a key strictly between its neighbours, so a card can
 * be placed anywhere without rewriting the ranks of its siblings — which is
 * what keeps concurrent drags from different users from trampling each other.
 *
 * Invariant: generated keys never end with 'a', so there is always room
 * below any existing key (keys may start with 'a', e.g. head inserts walk
 * 'n' → 'g' → 'd' → 'b' → 'an' → 'ag' → …).
 */
const DIGITS = 'abcdefghijklmnopqrstuvwxyz';

export function rankBetween(prev: string | null, next: string | null): string {
  if (prev !== null && next !== null && prev >= next) {
    throw new RangeError(`rankBetween: "${prev}" must sort before "${next}"`);
  }
  return midpoint(prev ?? '', next);
}

/** Returns a key strictly between `a` and `b` (`''` = -infinity, null = +infinity). */
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

  // A whole digit fits between the two first digits — but never bare 'a',
  // because nothing could ever be placed before it.
  const mid = Math.round((digitA + digitB) / 2);
  if (digitB - digitA > 1 && mid > 0) {
    return DIGITS.charAt(mid);
  }

  if (digitA >= 0) {
    // Adjacent first digits: keep a's digit and create room above a's tail.
    return DIGITS.charAt(digitA) + midpoint(a.slice(1), null);
  }
  if (digitB === 0 && b !== null) {
    // a is -infinity and b starts with 'a': descend into b's tail.
    return DIGITS.charAt(0) + midpoint('', b.slice(1));
  }
  // a is -infinity and b starts with 'b': anything in the 'a…' range fits.
  return DIGITS.charAt(0) + midpoint('', null);
}
