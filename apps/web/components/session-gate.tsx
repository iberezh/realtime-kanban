'use client';

import { Center, Loader } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';
import { getMe } from '@/lib/api';
import { useSessionStore } from '@/stores/session-store';

interface SessionGateProps {
  children: ReactNode;
}

/**
 * Bootstraps the session on first render. Redirects to /login on 401.
 * Shows a loading spinner until the session resolves.
 */
export function SessionGate({ children }: SessionGateProps) {
  const router = useRouter();
  const { status, setProfile, clearProfile } = useSessionStore();

  useEffect(() => {
    if (status !== 'loading') return;
    let active = true;
    getMe()
      .then((profile) => {
        if (active) setProfile(profile);
      })
      .catch(() => {
        if (active) {
          clearProfile();
          router.replace('/login');
        }
      });
    return () => {
      active = false;
    };
  }, [status, setProfile, clearProfile, router]);

  if (status === 'loading') {
    return (
      <Center h="100dvh">
        <Loader />
      </Center>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return <>{children}</>;
}
