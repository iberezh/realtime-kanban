'use client';

import { LayoutGroup, motion } from 'framer-motion';
import demo from './demo.module.css';
import { type CardData, DemoCard } from './demo-card';
import { HERO_COLUMNS, HERO_MOVER, HERO_STATIC, HERO_TICKER } from './demo-data';
import { useBoardLoop } from './use-board-loop';

const Cursor = ({ cls, color, name }: { cls: string | undefined; color: string; name: string }) => (
  <div className={`${demo.cursor} ${cls}`}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M5 3l15 9-7 1.5L9 21z" />
    </svg>
    <span className={demo.tag} style={{ background: color }}>
      {name}
    </span>
  </div>
);

/** Self-playing board: a card physically glides from Doing to Done while cursors roam. */
export function LiveBoardDemo() {
  const step = useBoardLoop(2, 2800);
  const moverColumn = step === 1 ? 'done' : 'doing';
  const cardsFor = (columnId: string): CardData[] => {
    const base = HERO_STATIC[columnId] ?? [];
    return moverColumn === columnId ? [HERO_MOVER, ...base] : base;
  };
  const line = step === 1 ? HERO_TICKER[1] : HERO_TICKER[0];

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
      <LayoutGroup>
        <div className={demo.cols}>
          {HERO_COLUMNS.map((column) => {
            const cards = cardsFor(column.id);
            return (
              <div key={column.id} className={demo.col}>
                <h4>
                  {column.title} <span>{cards.length}</span>
                </h4>
                {cards.map((card) => (
                  <DemoCard key={card.id} card={card} />
                ))}
              </div>
            );
          })}
        </div>
      </LayoutGroup>
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
      <Cursor cls={demo.curMara} color="#36c5a8" name="Mara" />
      <Cursor cls={demo.curAlex} color="#ff6b9d" name="Alex" />
    </div>
  );
}
