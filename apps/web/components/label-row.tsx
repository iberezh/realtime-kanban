'use client';

import { ActionIcon, ColorSwatch, Group, TextInput } from '@mantine/core';
import { useState } from 'react';
import type { Label } from '@/lib/types';

interface LabelRowProps {
  label: Label;
  onRename: (name: string) => void;
  onDelete: () => void;
}

/** One editable label: rename on blur, delete on demand. */
export function LabelRow({ label, onRename, onDelete }: LabelRowProps) {
  const [name, setName] = useState(label.name);

  const commit = (): void => {
    const next = name.trim();
    if (next && next !== label.name) {
      onRename(next);
    }
  };

  return (
    <Group gap="xs" wrap="nowrap">
      <ColorSwatch color={label.color} size={18} />
      <TextInput
        flex={1}
        size="xs"
        value={name}
        onChange={(event) => setName(event.currentTarget.value)}
        onBlur={commit}
      />
      <ActionIcon
        variant="subtle"
        color="red"
        aria-label={`Delete ${label.name}`}
        onClick={onDelete}
      >
        ×
      </ActionIcon>
    </Group>
  );
}
