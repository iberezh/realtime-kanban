/** Mirrors the API's database rows and wire protocol (apps/api/src/realtime/wire.ts). */

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  color: string;
}

export interface AccountProfile {
  id: string;
  name: string;
  plan: string;
}

export interface PublicProfile {
  user: UserProfile;
  account: AccountProfile;
}

export interface Board {
  id: string;
  title: string;
  createdAt: string;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  rank: string;
  createdAt: string;
}

export interface Card {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  dueAt: string | null;
  rank: string;
  createdAt: string;
  updatedAt: string;
  labelIds: string[];
}

/** The card shape on the wire: a raw DB row, without the joined `labelIds`. */
export type WireCard = Omit<Card, 'labelIds'>;

export interface Label {
  id: string;
  accountId: string;
  name: string;
  color: string;
  createdAt: string;
}

/** A workspace member (distinct from {@link Member}, which is live socket presence). */
export interface AccountMember {
  userId: string;
  name: string;
  color: string;
  role: 'owner' | 'member';
}

export interface ActivityEntry {
  id: string;
  boardId: string;
  actorId: string | null;
  type: string;
  data: Record<string, unknown>;
  createdAt: string;
}

export interface ColumnView extends Column {
  cards: Card[];
}

export interface BoardView extends Board {
  columns: ColumnView[];
}

export type Plan = 'free' | 'pro' | 'business';

export interface PlanLimits {
  boards: number;
  activityDays: number;
  guestLinks: boolean;
  customLabels: boolean;
}

export interface BillingStatus {
  plan: Plan;
  mode: 'stripe' | 'mock';
  limits: PlanLimits;
  usage: { boards: number };
}

export interface ShareLink {
  id: string;
  boardId: string;
  token: string;
  createdBy: string | null;
  createdAt: string;
}

/** A board resolved from a public share token: the board plus the labels its cards reference. */
export interface SharedBoardView extends BoardView {
  labels: Label[];
}

export interface Member {
  socketId: string;
  name: string;
  color: string;
}

export interface Identity {
  name: string;
  color: string;
}

export type WireEvent =
  | { type: 'board.renamed'; boardId: string; board: Board }
  | { type: 'board.deleted'; boardId: string }
  | { type: 'column.created'; boardId: string; column: Column }
  | { type: 'column.renamed'; boardId: string; column: Column }
  | { type: 'column.moved'; boardId: string; column: Column }
  | { type: 'column.deleted'; boardId: string; columnId: string }
  | { type: 'card.created'; boardId: string; card: WireCard }
  | { type: 'card.updated'; boardId: string; card: WireCard }
  | { type: 'card.moved'; boardId: string; card: WireCard }
  | { type: 'card.deleted'; boardId: string; columnId: string; cardId: string }
  | { type: 'card.label_attached'; boardId: string; cardId: string; labelId: string }
  | { type: 'card.label_detached'; boardId: string; cardId: string; labelId: string }
  | { type: 'card.assignee_changed'; boardId: string; card: WireCard };

const WIRE_TYPES: ReadonlySet<string> = new Set([
  'board.renamed',
  'board.deleted',
  'column.created',
  'column.renamed',
  'column.moved',
  'column.deleted',
  'card.created',
  'card.updated',
  'card.moved',
  'card.deleted',
  'card.label_attached',
  'card.label_detached',
  'card.assignee_changed',
]);

/** Socket payloads arrive untyped — gate them before they reach the store. */
export function isWireEvent(value: unknown): value is WireEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as { type?: unknown; boardId?: unknown };
  return typeof candidate.boardId === 'string' && WIRE_TYPES.has(candidate.type as string);
}
