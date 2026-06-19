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
  wipLimit: number | null;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  cardId: string;
  text: string;
  done: boolean;
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
  checklist: ChecklistItem[];
}

/** The card shape on the wire: a raw DB row, without the joined `labelIds`/`checklist`. */
export type WireCard = Omit<Card, 'labelIds' | 'checklist'>;

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
  expiresAt: string | null;
  createdAt: string;
}

/** A board resolved from a public share token: the board plus the labels its cards reference. */
export interface SharedBoardView extends BoardView {
  labels: Label[];
}

export * from './wire-types';
