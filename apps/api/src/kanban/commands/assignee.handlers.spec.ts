import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { EventBus } from '@nestjs/cqrs';
import { describe, expect, it, vi } from 'vitest';
import type { Board, Card } from '../../database/schema';
import { CardAssigneeChangedEvent } from '../events/kanban.events';
import type { BoardsRepository } from '../repositories/boards.repository';
import type { CardsRepository } from '../repositories/cards.repository';
import type { MembersRepository } from '../repositories/members.repository';
import { SetCardAssigneeCommand } from './assignee.commands';
import { SetCardAssigneeHandler } from './assignee.handlers';

const ACCOUNT = 'acct-1';
const ACTOR = 'actor-1';
const BOARD_ID = 'board-1';
const CARD_ID = 'card-1';
const COL_ID = 'col-1';
const USER_ID = 'user-1';

const makeCard = (): Card => ({
  id: CARD_ID,
  columnId: COL_ID,
  title: 'Test',
  description: null,
  assigneeId: null,
  dueAt: null,
  rank: 'm',
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeBoard = (accountId = ACCOUNT): Board => ({
  id: BOARD_ID,
  accountId,
  title: 'Board',
  createdAt: new Date(),
});

interface HandlerSetup {
  handler: SetCardAssigneeHandler;
  publish: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
}

function makeHandler(overrides: {
  card?: Card | null;
  board?: Board | null;
  isMember?: boolean;
}): HandlerSetup {
  const update = vi.fn(async () => makeCard());
  const publish = vi.fn();
  const cards = {
    findById: vi.fn(async () => (overrides.card === undefined ? makeCard() : overrides.card)),
    update,
  } as unknown as CardsRepository;
  const boards = {
    findByColumnId: vi.fn(async () =>
      overrides.board === undefined ? makeBoard() : overrides.board,
    ),
  } as unknown as BoardsRepository;
  const members = {
    isMember: vi.fn(async () => overrides.isMember ?? true),
  } as unknown as MembersRepository;
  const eventBus = { publish } as unknown as EventBus;
  const handler = new SetCardAssigneeHandler(cards, boards, members, eventBus);
  return { handler, publish, update };
}

describe('SetCardAssigneeHandler', () => {
  it('throws NotFoundException if card not found', async () => {
    const { handler } = makeHandler({ card: null });
    await expect(
      handler.execute(new SetCardAssigneeCommand(CARD_ID, USER_ID, ACCOUNT, ACTOR)),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws ForbiddenException if board.accountId does not match', async () => {
    const { handler } = makeHandler({ board: makeBoard('other-acct') });
    await expect(
      handler.execute(new SetCardAssigneeCommand(CARD_ID, USER_ID, ACCOUNT, ACTOR)),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws UnprocessableEntityException if assigneeId provided but not a member', async () => {
    const { handler } = makeHandler({ isMember: false });
    await expect(
      handler.execute(new SetCardAssigneeCommand(CARD_ID, USER_ID, ACCOUNT, ACTOR)),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('happy path with null assigneeId: skips member check and publishes event', async () => {
    const { publish, update } = makeHandler({});
    const members = { isMember: vi.fn() } as unknown as MembersRepository;
    const cards = { findById: vi.fn(async () => makeCard()), update } as unknown as CardsRepository;
    const boards = {
      findByColumnId: vi.fn(async () => makeBoard()),
    } as unknown as BoardsRepository;
    const nullHandler = new SetCardAssigneeHandler(cards, boards, members, {
      publish,
    } as unknown as EventBus);

    await nullHandler.execute(new SetCardAssigneeCommand(CARD_ID, null, ACCOUNT, ACTOR));
    expect(members.isMember).not.toHaveBeenCalled();
    expect(publish).toHaveBeenCalledWith(expect.any(CardAssigneeChangedEvent));
  });

  it('happy path with valid member: updates and publishes event', async () => {
    const { handler, publish, update } = makeHandler({ isMember: true });
    await handler.execute(new SetCardAssigneeCommand(CARD_ID, USER_ID, ACCOUNT, ACTOR));
    expect(update).toHaveBeenCalledWith(CARD_ID, { assigneeId: USER_ID });
    expect(publish).toHaveBeenCalledWith(expect.any(CardAssigneeChangedEvent));
  });
});
