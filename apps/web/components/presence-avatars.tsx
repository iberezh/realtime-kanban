'use client';

import { Avatar, AvatarGroup, Tooltip } from '@mantine/core';
import { initials } from '@/lib/format';
import type { Member } from '@/lib/types';

export function PresenceAvatars({ members }: { members: Member[] }) {
  const shown = members.slice(0, 6);
  const overflow = members.length - shown.length;

  return (
    <AvatarGroup>
      {shown.map((member) => (
        <Tooltip key={member.socketId} label={member.name} withArrow>
          <Avatar
            size="md"
            color="initials"
            styles={{ placeholder: { background: member.color, color: '#fff' } }}
          >
            {initials(member.name)}
          </Avatar>
        </Tooltip>
      ))}
      {overflow > 0 && <Avatar size="md">+{overflow}</Avatar>}
    </AvatarGroup>
  );
}
