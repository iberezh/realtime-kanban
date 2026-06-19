'use client';

import { motion } from 'framer-motion';
import demo from './demo.module.css';

/** A position within the board, expressed as percentages of the demo box. */
export interface CursorPos {
  left: string;
  top: string;
}

interface DemoCursorProps {
  color: string;
  name: string;
  pos: CursorPos;
}

/** A teammate's cursor that drifts toward whatever card is moving this step. */
export function DemoCursor({ color, name, pos }: DemoCursorProps) {
  return (
    <motion.div
      className={demo.cursor}
      initial={false}
      animate={{ left: pos.left, top: pos.top }}
      transition={{ type: 'spring', stiffness: 110, damping: 20 }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={color} aria-hidden="true">
        <path d="M5 3l15 9-7 1.5L9 21z" />
      </svg>
      <span className={demo.tag} style={{ background: color }}>
        {name}
      </span>
    </motion.div>
  );
}
