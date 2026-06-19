'use client';

import { motion, type Transition } from 'framer-motion';
import demo from './demo.module.css';

export interface CardData {
  id: string;
  chip?: { label: string; bg: string; color: string };
  title: string;
  avatar: { initial: string; color: string };
  code: string;
}

const SPRING: Transition = { type: 'spring', stiffness: 380, damping: 32 };

/**
 * A board card. It pops in when freshly created (`spawn`) and otherwise glides between
 * columns via shared-layout animation when its column changes.
 */
export function DemoCard({ card, spawn = false }: { card: CardData; spawn?: boolean }) {
  return (
    <motion.div
      layout
      layoutId={card.id}
      transition={SPRING}
      className={demo.kc}
      initial={spawn ? { opacity: 0, scale: 0.82 } : false}
      animate={{ opacity: 1, scale: 1 }}
    >
      {card.chip && (
        <span className={demo.chip} style={{ background: card.chip.bg, color: card.chip.color }}>
          {card.chip.label}
        </span>
      )}
      {card.title}
      <div className={demo.foot}>
        <span className={demo.miniAv} style={{ background: card.avatar.color }}>
          {card.avatar.initial}
        </span>
        <span className={demo.key}>{card.code}</span>
      </div>
    </motion.div>
  );
}
