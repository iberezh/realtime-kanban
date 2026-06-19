'use client';

import { LayoutGroup } from 'framer-motion';
import demo from './demo.module.css';
import { type CardData, DemoCard } from './demo-card';
import { GUEST_COLUMNS, GUEST_MOVER, GUEST_STATIC } from './demo-data';
import styles from './landing.module.css';
import { useBoardLoop } from './use-board-loop';

/** Read-only client preview: a card ships to Done in real time, no account needed. */
export function GuestBoard() {
  const step = useBoardLoop(2, 3000);
  const moverColumn = step === 1 ? 'done' : 'doing';
  const cardsFor = (columnId: string): CardData[] => {
    const base = GUEST_STATIC[columnId] ?? [];
    return moverColumn === columnId ? [GUEST_MOVER, ...base] : base;
  };

  return (
    <div className={styles.guestBoard}>
      <span className={styles.roBadge}>read-only · live</span>
      <LayoutGroup>
        <div className={demo.cols} style={{ gridTemplateColumns: '1fr 1fr' }}>
          {GUEST_COLUMNS.map((column) => {
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
    </div>
  );
}
