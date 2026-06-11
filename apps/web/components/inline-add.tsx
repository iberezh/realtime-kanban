'use client';

import { ActionIcon, Group, TextInput } from '@mantine/core';
import { useForm } from 'react-hook-form';

interface InlineAddProps {
  placeholder: string;
  onAdd: (title: string) => Promise<void>;
}

/** Single-field "add" form used for new columns and new cards. */
export function InlineAdd({ placeholder, onAdd }: InlineAddProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<{ title: string }>({ defaultValues: { title: '' } });

  const submit = async ({ title }: { title: string }): Promise<void> => {
    await onAdd(title.trim());
    reset();
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Group gap="xs" wrap="nowrap">
        <TextInput
          size="sm"
          flex={1}
          placeholder={placeholder}
          disabled={isSubmitting}
          {...register('title', { required: true, maxLength: 120 })}
        />
        <ActionIcon type="submit" variant="light" size="lg" loading={isSubmitting} aria-label="Add">
          +
        </ActionIcon>
      </Group>
    </form>
  );
}
