'use client';

import { Button, ColorSwatch, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { Controller, useForm } from 'react-hook-form';
import { MEMBER_COLORS } from '@/lib/identity';
import type { Identity } from '@/lib/types';

interface JoinFormProps {
  onJoin: (identity: Identity) => void;
}

export function JoinForm({ onJoin }: JoinFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Identity>({
    defaultValues: { name: '', color: MEMBER_COLORS[3] },
  });

  return (
    <Modal opened onClose={() => undefined} withCloseButton={false} title="Join the board" centered>
      <form onSubmit={handleSubmit(onJoin)}>
        <Stack gap="md">
          <TextInput
            label="Display name"
            placeholder="Ada Lovelace"
            data-autofocus
            error={errors.name?.message}
            {...register('name', {
              required: 'Pick a name others will see',
              maxLength: { value: 40, message: 'Keep it under 40 characters' },
            })}
          />
          <div>
            <Text size="sm" fw={500} mb={6}>
              Your color
            </Text>
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <Group gap="xs">
                  {MEMBER_COLORS.map((color) => (
                    <ColorSwatch
                      key={color}
                      color={color}
                      component="button"
                      type="button"
                      onClick={() => field.onChange(color)}
                      style={{
                        cursor: 'pointer',
                        outline:
                          field.value === color ? '2px solid var(--mantine-color-dark-9)' : 'none',
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </Group>
              )}
            />
          </div>
          <Button type="submit">Join</Button>
        </Stack>
      </form>
    </Modal>
  );
}
