import type { EventBus } from '@nestjs/cqrs';
import { describe, expect, it, vi } from 'vitest';
import type { Label } from '../database/schema';
import { CreateLabelCommand } from './label.commands';
import { LabelCreatedEvent } from './label.events';
import { CreateLabelHandler } from './label.handlers';
import type { LabelsRepository } from './labels.repository';

const ACCOUNT = 'acct-1';
const ACTOR = 'actor-1';

const makeLabel = (): Label => ({
  id: 'label-1',
  accountId: ACCOUNT,
  name: 'Bug',
  color: '#ef4444',
  createdAt: new Date(),
});

describe('CreateLabelHandler', () => {
  it('calls labels.create and publishes LabelCreatedEvent', async () => {
    const label = makeLabel();
    const create = vi.fn(async () => label);
    const publish = vi.fn();
    const labelsRepo = { create } as unknown as LabelsRepository;
    const eventBus = { publish } as unknown as EventBus;
    const handler = new CreateLabelHandler(labelsRepo, eventBus);

    const result = await handler.execute(new CreateLabelCommand(ACCOUNT, ACTOR, 'Bug', '#ef4444'));

    expect(create).toHaveBeenCalledWith({ accountId: ACCOUNT, name: 'Bug', color: '#ef4444' });
    expect(publish).toHaveBeenCalledWith(expect.any(LabelCreatedEvent));
    expect(result).toBe(label);
  });
});
