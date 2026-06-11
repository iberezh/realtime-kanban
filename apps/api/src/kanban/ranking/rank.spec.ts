import { describe, expect, it } from 'vitest';
import { rankBetween } from './rank';

describe('rankBetween', () => {
  it('produces an initial rank', () => {
    expect(rankBetween(null, null)).toBe('n');
  });

  it('inserts before, after and between', () => {
    const middle = rankBetween(null, null);
    const before = rankBetween(null, middle);
    const after = rankBetween(middle, null);
    const between = rankBetween(before, middle);

    expect(before < middle).toBe(true);
    expect(middle < after).toBe(true);
    expect(before < between && between < middle).toBe(true);
  });

  it('rejects out-of-order neighbours', () => {
    expect(() => rankBetween('m', 'b')).toThrow(RangeError);
    expect(() => rankBetween('m', 'm')).toThrow(RangeError);
  });

  it('survives repeated insertion at the head', () => {
    let head = rankBetween(null, null);
    for (let i = 0; i < 500; i += 1) {
      const next = rankBetween(null, head);
      expect(next < head).toBe(true);
      expect(next.endsWith('a')).toBe(false);
      head = next;
    }
  });

  it('survives repeated insertion at the tail', () => {
    let tail = rankBetween(null, null);
    for (let i = 0; i < 500; i += 1) {
      const next = rankBetween(tail, null);
      expect(next > tail).toBe(true);
      for (const char of next) {
        expect(char >= 'a' && char <= 'z').toBe(true);
      }
      tail = next;
    }
  });

  it('keeps a randomly built list strictly ordered and unique', () => {
    // Deterministic LCG so the scenario is reproducible across runs.
    let seed = 42;
    const random = (): number => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const ranks: string[] = [];
    for (let i = 0; i < 2000; i += 1) {
      const slot = Math.floor(random() * (ranks.length + 1));
      const prev = slot > 0 ? (ranks[slot - 1] ?? null) : null;
      const next = slot < ranks.length ? (ranks[slot] ?? null) : null;
      ranks.splice(slot, 0, rankBetween(prev, next));
    }

    for (let i = 1; i < ranks.length; i += 1) {
      expect(ranks[i - 1]! < ranks[i]!).toBe(true);
    }
    expect(new Set(ranks).size).toBe(ranks.length);
  });
});
