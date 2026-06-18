import { create } from 'zustand';
import type { PublicProfile } from '@/lib/types';

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface SessionState {
  profile: PublicProfile | null;
  status: SessionStatus;
  setProfile: (profile: PublicProfile) => void;
  clearProfile: () => void;
  setLoading: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  profile: null,
  status: 'loading',
  setProfile: (profile) => set({ profile, status: 'authenticated' }),
  clearProfile: () => set({ profile: null, status: 'unauthenticated' }),
  setLoading: () => set({ status: 'loading' }),
}));
