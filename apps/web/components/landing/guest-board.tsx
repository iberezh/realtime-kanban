'use client';

import { DemoBoard } from './demo-board';
import { DemoCursor } from './demo-cursor';
import { GUEST_CARDS, GUEST_COLUMNS, GUEST_CURSOR, GUEST_FRAMES } from './demo-data';
import styles from './landing.module.css';
import { useBoardLoop } from './use-board-loop';

const PARK = { left: '30%', top: '40%' };

/** Read-only client preview: the client watches a teammate ship "Checkout v2" to Done in real time. */
export function GuestBoard() {
  const step = useBoardLoop(GUEST_FRAMES.length, 2600);
  const cursor = GUEST_CURSOR[step] ?? PARK;

  return (
    <div className={styles.guestBoard}>
      <span className={styles.roBadge}>read-only · live</span>
      <DemoBoard
        columns={GUEST_COLUMNS}
        cards={GUEST_CARDS}
        frames={GUEST_FRAMES}
        step={step}
        twoColumn
      />
      <DemoCursor color="#7c5cff" name="Ivan" pos={cursor} />
    </div>
  );
}
