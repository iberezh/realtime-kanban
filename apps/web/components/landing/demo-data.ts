import type { CardData } from './demo-card';

export interface DemoColumn {
  id: string;
  title: string;
}

export interface TickerLine {
  who: string;
  color: string;
  msg: string;
}

/** Hero board: "Presence avatars" travels between Doing and Done as the loop ticks. */
export const HERO_COLUMNS: DemoColumn[] = [
  { id: 'todo', title: 'Todo' },
  { id: 'doing', title: 'Doing' },
  { id: 'done', title: 'Done' },
];

export const HERO_STATIC: Record<string, CardData[]> = {
  todo: [
    {
      id: 'h-onboarding',
      chip: { label: 'Design', bg: '#fff0e6', color: '#e0632a' },
      title: 'Onboarding flow',
      avatar: { initial: 'I', color: '#7c5cff' },
      code: 'LNE-12',
    },
    {
      id: 'h-empty',
      title: 'Empty states',
      avatar: { initial: 'A', color: '#ff6b9d' },
      code: 'LNE-19',
    },
  ],
  doing: [],
  done: [
    {
      id: 'h-sync',
      title: 'Realtime sync',
      avatar: { initial: 'I', color: '#7c5cff' },
      code: 'LNE-03',
    },
  ],
};

export const HERO_MOVER: CardData = {
  id: 'h-presence',
  chip: { label: 'Live', bg: '#e4fbf3', color: '#1f9e85' },
  title: 'Presence avatars',
  avatar: { initial: 'M', color: '#36c5a8' },
  code: 'LNE-08',
};

export const HERO_TICKER: [TickerLine, TickerLine] = [
  { who: 'I', color: '#7c5cff', msg: 'Ivan picked up “Presence avatars”' },
  { who: 'M', color: '#36c5a8', msg: 'Mara moved “Presence avatars” to Done ✓' },
];

/** Guest board: a read-only client view where "Checkout v2" ships to Done. */
export const GUEST_COLUMNS: DemoColumn[] = [
  { id: 'doing', title: 'Doing' },
  { id: 'done', title: 'Done' },
];

export const GUEST_STATIC: Record<string, CardData[]> = {
  doing: [],
  done: [
    {
      id: 'g-pricing',
      title: 'Pricing page',
      avatar: { initial: 'M', color: '#36c5a8' },
      code: 'LNE-15',
    },
  ],
};

export const GUEST_MOVER: CardData = {
  id: 'g-checkout',
  chip: { label: 'Build', bg: '#fff6e0', color: '#b07d1a' },
  title: 'Checkout v2',
  avatar: { initial: 'I', color: '#7c5cff' },
  code: 'LNE-22',
};
