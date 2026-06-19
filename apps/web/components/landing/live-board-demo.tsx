'use client';

import { motion } from 'framer-motion';
import demo from './demo.module.css';
import { DemoBoard } from './demo-board';
import { DemoCursor } from './demo-cursor';
import { HERO_CARDS, HERO_COLUMNS, HERO_CURSORS, HERO_FRAMES, HERO_TICKER } from './demo-data';
import { useBoardLoop } from './use-board-loop';

const IDLE = { who: 'M', color: '#36c5a8', msg: 'Realtime, always in sync' };
const PARK = { left: '50%', top: '40%' };

/** Self-playing board: a task is created in Todo and worked through to Done while cursors trail it. */
export function LiveBoardDemo() {
  const step = useBoardLoop(HERO_FRAMES.length, 2400);
  const line = HERO_TICKER[step] ?? IDLE;
  const ivan = HERO_CURSORS.ivan?.[step] ?? PARK;
  const mara = HERO_CURSORS.mara?.[step] ?? PARK;
  const alex = HERO_CURSORS.alex?.[step] ?? PARK;

  return (
    <div className={demo.demo} aria-hidden="true">
      <div className={demo.bar}>
        <span className={demo.ttl}>Q3 Launch</span>
        <span className={demo.avatars}>
          <span style={{ background: '#7c5cff' }}>I</span>
          <span style={{ background: '#36c5a8' }}>M</span>
          <span style={{ background: '#ff6b9d' }}>A</span>
        </span>
        <span className={demo.online}>
          <span className={demo.liveDot} />3 online
        </span>
      </div>
      <DemoBoard columns={HERO_COLUMNS} cards={HERO_CARDS} frames={HERO_FRAMES} step={step} />
      <div className={demo.ticker}>
        <span className={demo.who} style={{ background: line.color }}>
          {line.who}
        </span>
        <motion.span
          key={step}
          className={demo.msg}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {line.msg}
        </motion.span>
      </div>
      <DemoCursor color="#7c5cff" name="Ivan" pos={ivan} />
      <DemoCursor color="#36c5a8" name="Mara" pos={mara} />
      <DemoCursor color="#ff6b9d" name="Alex" pos={alex} />
    </div>
  );
}
