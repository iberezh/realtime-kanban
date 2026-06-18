'use client';

import { Alert, Button, ColorInput, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useState } from 'react';
import { createLabel, deleteLabel, listLabels, renameLabel } from '@/lib/workspace-api';
import { useBoardStore } from '@/stores/board-store';
import { LabelRow } from './label-row';

const PALETTE = ['#7c5cff', '#ff6b6b', '#22c1a3', '#f5a623', '#ff5fa2'];
const DEFAULT_COLOR = '#7c5cff';

interface LabelManagerProps {
  opened: boolean;
  onClose: () => void;
}

/** Workspace-wide label CRUD; the store is the single source so cards stay in sync. */
export function LabelManager({ opened, onClose }: LabelManagerProps) {
  const labels = useBoardStore((state) => state.labels);
  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [error, setError] = useState<string | null>(null);

  const refresh = (): void => {
    // Actions are static — no need to subscribe to setLabels.
    void listLabels().then(
      (next) => useBoardStore.getState().setLabels(next),
      () => undefined,
    );
  };

  const add = async (): Promise<void> => {
    if (!name.trim()) {
      return;
    }
    try {
      await createLabel(name.trim(), color);
      setName('');
      setError(null);
      refresh();
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Could not create label');
    }
  };
  const rename = (id: string, value: string): void => {
    void renameLabel(id, value).then(refresh, () => undefined);
  };
  const remove = (id: string): void => {
    void deleteLabel(id).then(refresh, () => undefined);
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Labels" centered>
      <Stack gap="sm">
        <Group align="flex-end" gap="xs" wrap="nowrap">
          <TextInput
            flex={1}
            label="New label"
            placeholder="e.g. Bug"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
          />
          <ColorInput
            w={132}
            label="Color"
            format="hex"
            swatches={PALETTE}
            value={color}
            onChange={setColor}
          />
          <Button onClick={add}>Add</Button>
        </Group>
        {error && (
          <Alert color="orange" variant="light">
            {error}
          </Alert>
        )}
        {labels.length === 0 ? (
          <Text size="sm" c="dimmed">
            No labels yet.
          </Text>
        ) : (
          labels.map((label) => (
            <LabelRow
              key={label.id}
              label={label}
              onRename={(value) => rename(label.id, value)}
              onDelete={() => remove(label.id)}
            />
          ))
        )}
      </Stack>
    </Modal>
  );
}
