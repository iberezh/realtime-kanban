import type { Metadata } from 'next';
import { GuestBoard } from '@/components/guest-board';

// Share links are private by token — keep them out of search indexes.
export const metadata: Metadata = {
  title: 'Shared board · Lane',
  robots: { index: false, follow: false },
};

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <GuestBoard token={token} />;
}
