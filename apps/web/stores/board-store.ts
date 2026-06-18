import { create } from 'zustand';
import type { AccountMember, BoardView, Label, Member, WireEvent } from '@/lib/types';
import { applyEvent } from './apply-event';

interface BoardState {
  view: BoardView | null;
  members: Member[];
  labels: Label[];
  accountMembers: AccountMember[];
  deleted: boolean;
  error: string | null;
  setView: (view: BoardView) => void;
  setMembers: (members: Member[]) => void;
  setLabels: (labels: Label[]) => void;
  setAccountMembers: (accountMembers: AccountMember[]) => void;
  setError: (error: string) => void;
  apply: (event: WireEvent) => void;
  /** Rollback target for failed optimistic updates. */
  restore: (view: BoardView | null) => void;
  reset: () => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  view: null,
  members: [],
  labels: [],
  accountMembers: [],
  deleted: false,
  error: null,
  setView: (view) => set({ view, error: null }),
  setMembers: (members) => set({ members }),
  setLabels: (labels) => set({ labels }),
  setAccountMembers: (accountMembers) => set({ accountMembers }),
  setError: (error) => set({ error }),
  apply: (event) =>
    set((state) => {
      if (event.type === 'board.deleted') {
        return { deleted: true };
      }
      return state.view ? { view: applyEvent(state.view, event) } : {};
    }),
  restore: (view) => set({ view }),
  reset: () =>
    set({ view: null, members: [], labels: [], accountMembers: [], deleted: false, error: null }),
}));
