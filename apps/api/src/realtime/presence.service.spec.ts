import { describe, expect, it } from 'vitest';
import { PresenceService } from './presence.service';

const member = (socketId: string, name = socketId) => ({ socketId, name, color: '#ff5533' });

describe('PresenceService', () => {
  it('tracks members per board', () => {
    const presence = new PresenceService();
    presence.join('b1', member('s1', 'Ann'));
    const members = presence.join('b1', member('s2', 'Bob'));

    expect(members.map((m) => m.name)).toEqual(['Ann', 'Bob']);
    expect(presence.list('b2')).toEqual([]);
  });

  it('replaces the entry when the same socket joins again', () => {
    const presence = new PresenceService();
    presence.join('b1', member('s1', 'Ann'));
    const members = presence.join('b1', member('s1', 'Ann (renamed)'));

    expect(members).toHaveLength(1);
    expect(members[0]?.name).toBe('Ann (renamed)');
  });

  it('leave returns null when the socket was not a member', () => {
    const presence = new PresenceService();
    presence.join('b1', member('s1'));

    expect(presence.leave('b1', 'ghost')).toBeNull();
    expect(presence.leave('b1', 's1')).toEqual([]);
  });

  it('leaveAll sweeps the socket from every board', () => {
    const presence = new PresenceService();
    presence.join('b1', member('s1'));
    presence.join('b2', member('s1'));
    presence.join('b2', member('s2'));

    const affected = presence.leaveAll('s1');

    expect(affected.map((entry) => entry.boardId).sort()).toEqual(['b1', 'b2']);
    expect(presence.list('b1')).toEqual([]);
    expect(presence.list('b2')).toHaveLength(1);
  });
});
