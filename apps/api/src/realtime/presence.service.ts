import { Injectable } from '@nestjs/common';

export interface Member {
  socketId: string;
  name: string;
  color: string;
}

/**
 * In-memory presence per board. Good for a single instance; a multi-instance
 * deployment would move this to Redis alongside the Socket.IO adapter.
 */
@Injectable()
export class PresenceService {
  private readonly boards = new Map<string, Map<string, Member>>();

  join(boardId: string, member: Member): Member[] {
    const members = this.boards.get(boardId) ?? new Map<string, Member>();
    members.set(member.socketId, member);
    this.boards.set(boardId, members);
    return this.list(boardId);
  }

  /** Removes the socket from one board. Returns the new member list, or null if nothing changed. */
  leave(boardId: string, socketId: string): Member[] | null {
    const members = this.boards.get(boardId);
    if (!members?.delete(socketId)) {
      return null;
    }
    if (members.size === 0) {
      this.boards.delete(boardId);
    }
    return this.list(boardId);
  }

  /** Removes the socket everywhere (disconnect). Returns affected boards with their new lists. */
  leaveAll(socketId: string): Array<{ boardId: string; members: Member[] }> {
    const affected: Array<{ boardId: string; members: Member[] }> = [];
    // Snapshot the keys: leave() deletes emptied boards while we iterate.
    for (const boardId of [...this.boards.keys()]) {
      const members = this.leave(boardId, socketId);
      if (members) {
        affected.push({ boardId, members });
      }
    }
    return affected;
  }

  list(boardId: string): Member[] {
    return Array.from(this.boards.get(boardId)?.values() ?? []);
  }
}
