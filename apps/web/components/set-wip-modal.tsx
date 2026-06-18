'use client';

import { Button, Group, Modal, NumberInput, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';
import { setColumnWipLimit } from '@/lib/api';

interface SetWipModalProps {
  columnId: string;
  current: number | null;
  opened: boolean;
  onClose: () => void;
}

export function SetWipModal({ columnId, current, opened, onClose }: SetWipModalProps) {
  const [value, setValue] = useState<number | string>(current ?? '');

  // Resync from the (possibly realtime-updated) column each time the modal opens.
  useEffect(() => {
    if (opened) {
      setValue(current ?? '');
    }
  }, [opened, current]);

  const save = async (limit: number | null): Promise<void> => {
    await setColumnWipLimit(columnId, limit).catch(() => undefined);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="WIP limit" centered size="sm">
      <Stack gap="md">
        <NumberInput
          label="Max cards in this column"
          placeholder="No limit"
          min={1}
          max={999}
          value={value}
          onChange={setValue}
        />
        <Group justify="space-between">
          <Button variant="subtle" color="gray" onClick={() => save(null)}>
            Clear limit
          </Button>
          <Button onClick={() => save(typeof value === 'number' ? value : null)}>Save</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
