'use client';

import { LayoutGroup } from 'framer-motion';
import demo from './demo.module.css';
import { type CardData, DemoCard } from './demo-card';

/** A board column. */
export interface BoardColumn {
  id: string;
  title: string;
}

/** One moment in the loop: each column listed with the card ids it currently holds, top to bottom. */
export type Frame = Record<string, string[]>;

function presentIn(frame: Frame | undefined, id: string): boolean {
  return frame ? Object.values(frame).some((ids) => ids.includes(id)) : false;
}

interface DemoBoardProps {
  columns: BoardColumn[];
  cards: Record<string, CardData>;
  frames: Frame[];
  step: number;
  twoColumn?: boolean;
}

/** Renders the current frame; cards absent from the previous frame pop in, the rest glide. */
export function DemoBoard({ columns, cards, frames, step, twoColumn = false }: DemoBoardProps) {
  const frame = frames[step] ?? {};
  const previous = frames[(step - 1 + frames.length) % frames.length];

  return (
    <LayoutGroup>
      <div className={demo.cols} style={twoColumn ? { gridTemplateColumns: '1fr 1fr' } : undefined}>
        {columns.map((column) => {
          const ids = frame[column.id] ?? [];
          return (
            <div key={column.id} className={demo.col}>
              <h4>
                {column.title} <span>{ids.length}</span>
              </h4>
              {ids.map((id) => {
                const card = cards[id];
                return card ? (
                  <DemoCard key={id} card={card} spawn={!presentIn(previous, id)} />
                ) : null;
              })}
            </div>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
