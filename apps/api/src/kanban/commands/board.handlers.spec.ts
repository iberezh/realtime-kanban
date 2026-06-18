import { ForbiddenException } from '@nestjs/common';
import type { EventBus } from '@nestjs/cqrs';
import { describe, expect, it, vi } from 'vitest';
import type { AccountsRepository } from '../../billing/accounts.repository';
import type { Account, Board } from '../../database/schema';
import type { BoardsRepository } from '../repositories/boards.repository';
import { CreateBoardCommand } from './board.commands';
import { CreateBoardHandler } from './board.handlers';

const ACCOUNT = 'acct-1';
const ACTOR = 'actor-1';

const makeBoard = (): Board => ({
  id: 'b1',
  accountId: ACCOUNT,
  title: 'New',
  createdAt: new Date(),
});

function setup(plan: string, count: number) {
  const create = vi.fn(async () => makeBoard());
  const boards = {
    create,
    countByAccount: vi.fn(async () => count),
  } as unknown as BoardsRepository;
  const accounts = {
    findById: vi.fn(async () => ({ plan }) as Account),
  } as unknown as AccountsRepository;
  const publish = vi.fn();
  const handler = new CreateBoardHandler(boards, accounts, { publish } as unknown as EventBus);
  return { handler, create, publish };
}

describe('CreateBoardHandler', () => {
  const cmd = new CreateBoardCommand('New', ACCOUNT, ACTOR);

  it('creates a board when under the plan limit', async () => {
    const { handler, create, publish } = setup('free', 0);
    await handler.execute(cmd);
    expect(create).toHaveBeenCalled();
    expect(publish).toHaveBeenCalled();
  });

  it('forbids creating past the free plan board limit', async () => {
    const { handler, create } = setup('free', 1);
    await expect(handler.execute(cmd)).rejects.toBeInstanceOf(ForbiddenException);
    expect(create).not.toHaveBeenCalled();
  });

  it('allows many boards on the business plan', async () => {
    const { handler, create } = setup('business', 99);
    await handler.execute(cmd);
    expect(create).toHaveBeenCalled();
  });
});
