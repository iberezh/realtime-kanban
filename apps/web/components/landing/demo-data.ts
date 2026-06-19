import type { BoardColumn, Frame } from './demo-board';
import type { CardData } from './demo-card';
import type { CursorPos } from './demo-cursor';

export interface TickerLine {
  who: string;
  color: string;
  msg: string;
}

/**
 * Hero board: "Auth guard" is created in Todo, then worked across Doing into Done while the
 * other cards stay put — a calm, legible workflow rather than a busy shuffle.
 */
export const HERO_COLUMNS: BoardColumn[] = [
  { id: 'todo', title: 'Todo' },
  { id: 'doing', title: 'Doing' },
  { id: 'done', title: 'Done' },
];

export const HERO_CARDS: Record<string, CardData> = {
  onboard: {
    id: 'onboard',
    chip: { label: 'Design', bg: '#fff0e6', color: '#e0632a' },
    title: 'Onboarding flow',
    avatar: { initial: 'A', color: '#ff6b9d' },
    code: 'LNE-12',
  },
  presence: {
    id: 'presence',
    chip: { label: 'Live', bg: '#e4fbf3', color: '#1f9e85' },
    title: 'Presence avatars',
    avatar: { initial: 'M', color: '#36c5a8' },
    code: 'LNE-08',
  },
  sync: {
    id: 'sync',
    title: 'Realtime sync',
    avatar: { initial: 'I', color: '#7c5cff' },
    code: 'LNE-03',
  },
  auth: {
    id: 'auth',
    chip: { label: 'Build', bg: '#efeaff', color: '#7c5cff' },
    title: 'Auth guard',
    avatar: { initial: 'I', color: '#7c5cff' },
    code: 'LNE-21',
  },
};

export const HERO_FRAMES: Frame[] = [
  { todo: ['onboard'], doing: ['presence'], done: ['sync'] },
  { todo: ['onboard', 'auth'], doing: ['presence'], done: ['sync'] },
  { todo: ['onboard'], doing: ['presence', 'auth'], done: ['sync'] },
  { todo: ['onboard'], doing: ['presence'], done: ['sync', 'auth'] },
];

export const HERO_TICKER: TickerLine[] = [
  { who: 'M', color: '#36c5a8', msg: 'Realtime, always in sync' },
  { who: 'I', color: '#7c5cff', msg: 'Ivan created “Auth guard”' },
  { who: 'M', color: '#36c5a8', msg: 'Mara moved “Auth guard” to Doing' },
  { who: 'M', color: '#36c5a8', msg: 'Mara shipped “Auth guard” to Done ✓' },
];

export const HERO_CURSORS: Record<string, CursorPos[]> = {
  mara: [
    { left: '48%', top: '34%' },
    { left: '20%', top: '56%' },
    { left: '49%', top: '56%' },
    { left: '78%', top: '56%' },
  ],
  alex: [
    { left: '70%', top: '30%' },
    { left: '34%', top: '42%' },
    { left: '64%', top: '48%' },
    { left: '30%', top: '32%' },
  ],
};

/** Guest board: a client watches "Checkout v2" appear and ship — a shorter, distinct rhythm. */
export const GUEST_COLUMNS: BoardColumn[] = [
  { id: 'doing', title: 'Doing' },
  { id: 'done', title: 'Done' },
];

export const GUEST_CARDS: Record<string, CardData> = {
  pricing: {
    id: 'pricing',
    title: 'Pricing page',
    avatar: { initial: 'M', color: '#36c5a8' },
    code: 'LNE-15',
  },
  checkout: {
    id: 'checkout',
    chip: { label: 'Build', bg: '#fff6e0', color: '#b07d1a' },
    title: 'Checkout v2',
    avatar: { initial: 'I', color: '#7c5cff' },
    code: 'LNE-22',
  },
};

export const GUEST_FRAMES: Frame[] = [
  { doing: [], done: ['pricing'] },
  { doing: ['checkout'], done: ['pricing'] },
  { doing: [], done: ['checkout', 'pricing'] },
];

export const GUEST_CURSOR: CursorPos[] = [
  { left: '30%', top: '40%' },
  { left: '27%', top: '52%' },
  { left: '73%', top: '56%' },
];
