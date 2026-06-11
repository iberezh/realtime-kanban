'use client';

import { useEffect } from 'react';
import { getBoard } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { type Identity, isWireEvent, type Member } from '@/lib/types';
import { useBoardStore } from '@/stores/board-store';

/** Loads the board, joins its realtime room, and feeds server events into the store. */
export function useBoard(boardId: string, identity: Identity | null): void {
  useEffect(() => {
    if (!identity) {
      return;
    }
    // Zustand actions are static — read them once instead of subscribing.
    const { setView, setMembers, setError, apply, reset } = useBoardStore.getState();
    let active = true;
    const socket = getSocket();

    getBoard(boardId)
      .then((view) => active && setView(view))
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'Failed to load board');
        }
      });

    const join = (): void => {
      socket.emit(
        'board:join',
        { boardId, ...identity },
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

    join();
    // Re-join after a reconnect, otherwise the socket lands outside its rooms.
    socket.on('connect', join);
    socket.on('board:event', onEvent);
    socket.on('presence:state', onPresence);

    return () => {
      active = false;
      socket.emit('board:leave', { boardId });
      socket.off('connect', join);
      socket.off('board:event', onEvent);
      socket.off('presence:state', onPresence);
      reset();
    };
  }, [boardId, identity]);
}
