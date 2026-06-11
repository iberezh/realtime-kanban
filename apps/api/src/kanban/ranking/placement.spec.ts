import { describe, expect, it } from 'vitest';
import { placementBefore } from './placement';

const items = [
  { id: 'first', rank: 'c' },
  { id: 'second', rank: 'm' },
  { id: 'third', rank: 't' },
];

describe('placementBefore', () => {
  it('places at the end when beforeId is null', () => {
    expect(placementBefore(items, null)).toEqual({ prev: 't', next: null });
  });

  it('places at the head', () => {
    expect(placementBefore(items, 'first')).toEqual({ prev: null, next: 'c' });
  });

  it('places between two items', () => {
    expect(placementBefore(items, 'third')).toEqual({ prev: 'm', next: 't' });
  });

  it('handles an empty list', () => {
    expect(placementBefore([], null)).toEqual({ prev: null, next: null });
  });

  it('returns null for an unknown beforeId', () => {
    expect(placementBefore(items, 'missing')).toBeNull();
  });
});
