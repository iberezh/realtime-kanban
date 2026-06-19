'use client';

import { useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

/** Advances a looping step index on an interval; stays at step 0 when reduced motion is preferred. */
export function useBoardLoop(steps: number, intervalMs: number): number {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce || steps <= 1) {
      return;
    }
    const timer = setInterval(() => setStep((current) => (current + 1) % steps), intervalMs);
    return () => clearInterval(timer);
  }, [reduce, steps, intervalMs]);

  return step;
}
