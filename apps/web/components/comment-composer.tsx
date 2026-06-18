'use client';

import { Button, Combobox, Group, Text, Textarea, useCombobox } from '@mantine/core';
import { useState } from 'react';
import { useBoardStore } from '@/stores/board-store';

interface CommentComposerProps {
  onSubmit: (body: string, mentionedUserIds: string[]) => Promise<void>;
}

const TRAILING_MENTION = /@(\w*)$/;

/** Comment input with `@name` autocomplete; resolves picked names to ids for notifications. */
export function CommentComposer({ onSubmit }: CommentComposerProps) {
  const members = useBoardStore((state) => state.accountMembers);
  const combobox = useCombobox();
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // name → userId for everyone the author has picked from the dropdown.
  const [picked, setPicked] = useState<Record<string, string>>({});

  const query = TRAILING_MENTION.exec(value)?.[1]?.toLowerCase();
  const matches =
    query === undefined
      ? []
      : members.filter((member) => member.name.toLowerCase().includes(query)).slice(0, 5);

  const sync = (next: string): void => {
    setValue(next);
    if (TRAILING_MENTION.test(next)) {
      combobox.openDropdown();
    } else {
      combobox.closeDropdown();
    }
  };

  const choose = (userId: string): void => {
    const member = members.find((candidate) => candidate.userId === userId);
    if (!member) {
      return;
    }
    setValue((current) => current.replace(TRAILING_MENTION, `@${member.name} `));
    setPicked((prev) => ({ ...prev, [member.name]: member.userId }));
    combobox.closeDropdown();
  };

  const submit = async (): Promise<void> => {
    const body = value.trim();
    if (!body) {
      return;
    }
    const ids = Object.entries(picked)
      .filter(([name]) => body.includes(`@${name}`))
      .map(([, id]) => id);
    setBusy(true);
    setError(null);
    try {
      await onSubmit(body, [...new Set(ids)]);
      setValue('');
      setPicked({});
    } catch {
      setError('Could not post your comment. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Combobox store={combobox} onOptionSubmit={choose}>
      <Combobox.Target>
        <Textarea
          autosize
          minRows={2}
          placeholder="Write a comment… use @ to mention a teammate"
          value={value}
          onChange={(event) => sync(event.currentTarget.value)}
        />
      </Combobox.Target>
      <Combobox.Dropdown hidden={matches.length === 0}>
        <Combobox.Options>
          {matches.map((member) => (
            <Combobox.Option key={member.userId} value={member.userId}>
              {member.name}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
      <Group justify="space-between" mt="xs">
        <Text size="xs" c="red">
          {error}
        </Text>
        <Button size="xs" loading={busy} onClick={submit}>
          Comment
        </Button>
      </Group>
    </Combobox>
  );
}
