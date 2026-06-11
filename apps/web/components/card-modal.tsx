'use client';

import { Button, Group, Modal, Stack, Textarea, TextInput } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { deleteCard, updateCard } from '@/lib/api';
import type { Card } from '@/lib/types';

interface CardModalProps {
  card: Card;
  onClose: () => void;
}

interface CardFormValues {
  title: string;
  description: string;
}

export function CardModal({ card, onClose }: CardModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CardFormValues>({
    defaultValues: { title: card.title, description: card.description ?? '' },
  });

  const submit = async (values: CardFormValues): Promise<void> => {
    await updateCard(card.id, { title: values.title, description: values.description });
    onClose();
  };

  const remove = async (): Promise<void> => {
    await deleteCard(card.id);
    onClose();
  };

  return (
    <Modal opened onClose={onClose} title="Edit card" centered>
      <form onSubmit={handleSubmit(submit)}>
        <Stack gap="md">
          <TextInput
            label="Title"
            error={errors.title?.message}
            {...register('title', {
              required: 'A card needs a title',
              maxLength: { value: 200, message: 'Keep it under 200 characters' },
            })}
          />
          <Textarea
            label="Description"
            autosize
            minRows={3}
            {...register('description', {
              maxLength: { value: 5000, message: 'Keep it under 5000 characters' },
            })}
          />
          <Group justify="space-between">
            <Button variant="subtle" color="red" onClick={remove}>
              Delete
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Save
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
