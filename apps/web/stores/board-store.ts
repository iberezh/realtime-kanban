import { create } from 'zustand';
import type { BoardView, Member, WireEvent } from '@/lib/types';
import { applyEvent } from './apply-event';

interface BoardState {
  view: BoardView | null;
  members: Member[];
  deleted: boolean;
  error: string | null;
  setView: (view: BoardView) => void;
  setMembers: (members: Member[]) => void;
  setError: (error: string) => void;
  apply: (event: WireEvent) => void;
  reset: () => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  view: null,
  members: [],
  deleted: false,
  error: null,
  setView: (view) => set({ view, error: null }),
  setMembers: (members) => set({ members }),
  setError: (error) => set({ error }),
  apply: (event) =>
    set((state) => {
      if (event.type === 'board.deleted') {
        return { deleted: true };
      }
      return state.view ? { view: applyEvent(state.view, event) } : {};
    }),
  reset: () => set({ view: null, members: [], deleted: false, error: null }),
}));
