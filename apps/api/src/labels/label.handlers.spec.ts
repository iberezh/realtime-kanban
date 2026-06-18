import { ForbiddenException } from '@nestjs/common';
import type { EventBus } from '@nestjs/cqrs';
import { describe, expect, it, vi } from 'vitest';
import type { AccountsRepository } from '../billing/accounts.repository';
import type { Account, Label } from '../database/schema';
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

const accountsOn = (plan: string): AccountsRepository =>
  ({ findById: vi.fn(async () => ({ plan }) as Account) }) as unknown as AccountsRepository;

describe('CreateLabelHandler', () => {
  it('creates and publishes when the plan allows custom labels', async () => {
    const label = makeLabel();
    const create = vi.fn(async () => label);
    const publish = vi.fn();
    const handler = new CreateLabelHandler(
      { create } as unknown as LabelsRepository,
      accountsOn('pro'),
      { publish } as unknown as EventBus,
    );

    const result = await handler.execute(new CreateLabelCommand(ACCOUNT, ACTOR, 'Bug', '#ef4444'));

    expect(create).toHaveBeenCalledWith({ accountId: ACCOUNT, name: 'Bug', color: '#ef4444' });
    expect(publish).toHaveBeenCalledWith(expect.any(LabelCreatedEvent));
    expect(result).toBe(label);
  });

  it('forbids label creation on the free plan', async () => {
    const create = vi.fn();
    const handler = new CreateLabelHandler(
      { create } as unknown as LabelsRepository,
      accountsOn('free'),
      { publish: vi.fn() } as unknown as EventBus,
    );

    await expect(
      handler.execute(new CreateLabelCommand(ACCOUNT, ACTOR, 'Bug', '#ef4444')),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(create).not.toHaveBeenCalled();
  });
});
