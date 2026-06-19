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
  /** When true, the cursor fades and scales in on mount — as if its owner just joined. */
  enter?: boolean;
}

/** A cursor that drifts to a target each step; with `enter` it also animates in on mount. */
export function DemoCursor({ color, name, pos, enter = false }: DemoCursorProps) {
  return (
    <motion.div
      className={demo.cursor}
      initial={enter ? { opacity: 0, scale: 0.4, left: pos.left, top: pos.top } : false}
      animate={{ opacity: 1, scale: 1, left: pos.left, top: pos.top }}
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
