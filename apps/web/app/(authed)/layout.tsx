import type { ReactNode } from 'react';
import { SessionGate } from '@/components/session-gate';

export default function AppLayout({ children }: { children: ReactNode }) {
  return <SessionGate>{children}</SessionGate>;
}
