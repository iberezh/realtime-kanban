'use client';

import {
  Alert,
  Button,
  Divider,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { deleteCard, updateCard } from '@/lib/api';
import { dateInputValue } from '@/lib/format';
import { useBoardStore } from '@/stores/board-store';
import { CardAssigneeSelect } from './card-assignee-select';
import { CardChecklist } from './card-checklist';
import { CardComments } from './card-comments';
import { CardLabelPicker } from './card-label-picker';

interface CardModalProps {
  cardId: string;
  onClose: () => void;
}

interface CardFormValues {
  title: string;
  description: string;
  dueAt: string;
}

export function CardModal({ cardId, onClose }: CardModalProps) {
  const card = useBoardStore((state) =>
    state.view?.columns.flatMap((column) => column.cards).find((item) => item.id === cardId),
  );

  // The card can vanish from under us when a teammate deletes it.
  useEffect(() => {
    if (!card) {
      onClose();
    }
  }, [card, onClose]);

  const [actionError, setActionError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CardFormValues>({
    defaultValues: {
      title: card?.title ?? '',
      description: card?.description ?? '',
      dueAt: dateInputValue(card?.dueAt ?? null),
    },
  });

  if (!card) {
    return null;
  }

  const submit = async (values: CardFormValues): Promise<void> => {
    try {
      await updateCard(card.id, {
        title: values.title,
        description: values.description,
        dueAt: values.dueAt ? `${values.dueAt}T00:00:00.000Z` : null,
      });
      onClose();
    } catch {
      setActionError('Could not save the card. Try again.');
    }
  };

  const remove = async (): Promise<void> => {
    try {
      await deleteCard(card.id);
      onClose();
    } catch {
      setActionError('Could not delete the card. Try again.');
    }
  };

  return (
    <Modal opened onClose={onClose} title="Edit card" centered size="lg">
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
          <Controller
            control={control}
            name="dueAt"
            render={({ field }) => (
              <DatePickerInput
                label="Due date"
                placeholder="Pick a date"
                clearable
                valueFormat="MMM D, YYYY"
                value={field.value || null}
                onChange={(value) => field.onChange(value ?? '')}
              />
            )}
          />
          <Divider />
          <div>
            <Text size="sm" fw={500} mb={6}>
              Labels
            </Text>
            <CardLabelPicker card={card} />
          </div>
          <CardAssigneeSelect card={card} />
          <Divider />
          <CardChecklist card={card} />
          <Divider />
          <CardComments cardId={card.id} />
          {actionError && (
            <Alert color="red" variant="light">
              {actionError}
            </Alert>
          )}
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
