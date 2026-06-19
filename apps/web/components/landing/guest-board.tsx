'use client';

import demo from './demo.module.css';
import { DemoBoard } from './demo-board';
import { DemoCursor } from './demo-cursor';
import { GUEST_CARDS, GUEST_COLUMNS, GUEST_FRAMES, GUEST_VIEWER, GUEST_WORKER } from './demo-data';
import { useBoardLoop } from './use-board-loop';

const PARK = { left: '50%', top: '50%' };

/** Read-only client preview: the client joins and watches a teammate ship "Checkout v2" to Done. */
export function GuestBoard() {
  const step = useBoardLoop(GUEST_FRAMES.length, 2600);
  const worker = GUEST_WORKER[step] ?? PARK;
  const viewer = GUEST_VIEWER[step] ?? PARK;

  return (
    <div className={demo.demo} aria-hidden="true">
      <div className={demo.bar}>
        <span className={demo.ttl}>Q3 Launch</span>
        <span className={demo.avatars}>
          <span style={{ background: '#7c5cff' }}>I</span>
          <span style={{ background: '#36c5a8' }}>M</span>
        </span>
        <span className={demo.online}>
          <span className={demo.liveDot} />
          read-only · live
        </span>
      </div>
      <DemoBoard
        columns={GUEST_COLUMNS}
        cards={GUEST_CARDS}
        frames={GUEST_FRAMES}
        step={step}
        twoColumn
      />
      <DemoCursor color="#7c5cff" name="Ivan" pos={worker} />
      <DemoCursor color="#ff8a5c" name="Guest" pos={viewer} enter />
    </div>
  );
}
