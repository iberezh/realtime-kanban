'use client';

import { useEffect, useState } from 'react';
import { resolveShareLink } from '@/lib/share-api';
import { getSocket } from '@/lib/socket';
import { isWireEvent, type Member } from '@/lib/types';
import { useBoardStore } from '@/stores/board-store';

/** Resolves a share token, then joins the board room as an anonymous read-only viewer. */
export function useGuestBoard(token: string): { loading: boolean; error: string | null } {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { setView, setLabels, setMembers, apply, reset } = useBoardStore.getState();
    let active = true;
    let boardId: string | null = null;
    const socket = getSocket();

    // Join by token, never by a client-supplied boardId — the server validates it.
    const join = (): void => {
      socket.emit(
        'guest:join',
        { token },
        (ack: { members: Member[] }) => active && setMembers(ack.members),
      );
    };
    const onEvent = (event: unknown): void => {
      if (isWireEvent(event) && event.boardId === boardId) {
        apply(event);
      }
    };
    const onPresence = (state: { boardId: string; members: Member[] }): void => {
      if (state.boardId === boardId) {
        setMembers(state.members);
      }
    };

    resolveShareLink(token).then(
      (view) => {
        if (!active) {
          return;
        }
        boardId = view.id;
        // Labels are shared so chips render; account members are deliberately
        // not loaded, so guests never see assignee identities.
        setLabels(view.labels);
        setView(view);
        setLoading(false);
        join();
        socket.on('connect', join);
        socket.on('board:event', onEvent);
        socket.on('presence:state', onPresence);
      },
      () => {
        if (active) {
          setError('This share link is no longer active');
          setLoading(false);
        }
      },
    );

    return () => {
      active = false;
      if (boardId) {
        socket.emit('board:leave', { boardId });
      }
      socket.off('connect', join);
      socket.off('board:event', onEvent);
      socket.off('presence:state', onPresence);
      reset();
    };
  }, [token]);

  return { loading, error };
}
