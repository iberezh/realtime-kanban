import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { EventBus } from '@nestjs/cqrs';
import { describe, expect, it, vi } from 'vitest';
import type { Board, Card, Column } from '../../database/schema';
import { CardMovedEvent } from '../events/kanban.events';
import type { BoardsRepository } from '../repositories/boards.repository';
import type { CardsRepository } from '../repositories/cards.repository';
import type { ColumnsRepository } from '../repositories/columns.repository';
import { MoveCardCommand } from './card.commands';
import { MoveCardHandler } from './card.handlers';

const ACCOUNT = 'acct-1';
const ACTOR = 'actor-1';

const column = (id: string, boardId = 'board-1'): Column => ({
  id,
  boardId,
  title: id,
  rank: 'm',
  wipLimit: null,
  createdAt: new Date(),
});

const board = (id: string, accountId = ACCOUNT): Board => ({
  id,
  accountId,
  title: id,
  createdAt: new Date(),
});

const card = (id: string, columnId: string, rank: string): Card => ({
  id,
  columnId,
  title: id,
  description: null,
  assigneeId: null,
  dueAt: null,
  rank,
  createdAt: new Date(),
  updatedAt: new Date(),
});

interface Setup {
  handler: MoveCardHandler;
  publish: ReturnType<typeof vi.fn>;
  move: ReturnType<typeof vi.fn>;
}

function setup(overrides: { targetBoard?: string; boardAccount?: string } = {}): Setup {
  const moving = card('moving', 'col-a', 'm');
  const move = vi.fn(async (id: string, columnId: string, rank: string) =>
    card(id, columnId, rank),
  );
  const cardsRepo = {
    findById: vi.fn(async () => moving),
    listRanks: vi.fn(async () => [
      { id: 'x', rank: 'g' },
      { id: 'y', rank: 'q' },
    ]),
    move,
  } as unknown as CardsRepository;
  const columnsRepo = {
    findById: vi.fn(async (id: string) =>
      id === 'col-a' ? column('col-a') : column(id, overrides.targetBoard ?? 'board-1'),
    ),
  } as unknown as ColumnsRepository;
  const boardsRepo = {
    findById: vi.fn(async (id: string) => board(id, overrides.boardAccount ?? ACCOUNT)),
  } as unknown as BoardsRepository;
  const publish = vi.fn();
  const handler = new MoveCardHandler(boardsRepo, columnsRepo, cardsRepo, {
    publish,
  } as unknown as EventBus);
  return { handler, publish, move };
}

describe('MoveCardHandler', () => {
  it('moves a card before another and publishes CardMovedEvent', async () => {
    const { handler, publish, move } = setup();
    const moved = await handler.execute(
      new MoveCardCommand('moving', 'col-b', 'y', ACCOUNT, ACTOR),
    );

    const [, , rank] = move.mock.calls[0] as [string, string, string];
    expect(rank > 'g' && rank < 'q').toBe(true);
    expect(moved.columnId).toBe('col-b');
    expect(publish).toHaveBeenCalledWith(expect.any(CardMovedEvent));
  });

  it('moves a card to the end when beforeCardId is null', async () => {
    const { handler, move } = setup();
    await handler.execute(new MoveCardCommand('moving', 'col-b', null, ACCOUNT, ACTOR));

    const [, , rank] = move.mock.calls[0] as [string, string, string];
    expect(rank > 'q').toBe(true);
  });

  it('rejects an unknown beforeCardId', async () => {
    const { handler } = setup();
    await expect(
      handler.execute(new MoveCardCommand('moving', 'col-b', 'missing', ACCOUNT, ACTOR)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects moves across boards', async () => {
    const { handler } = setup({ targetBoard: 'board-2' });
    await expect(
      handler.execute(new MoveCardCommand('moving', 'col-b', null, ACCOUNT, ACTOR)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects a move onto another account's board", async () => {
    const { handler, move } = setup({ boardAccount: 'intruder' });
    await expect(
      handler.execute(new MoveCardCommand('moving', 'col-b', null, ACCOUNT, ACTOR)),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(move).not.toHaveBeenCalled();
  });

  it('rejects a missing card', async () => {
    const cardsRepo = { findById: vi.fn(async () => null) } as unknown as CardsRepository;
    const handler = new MoveCardHandler(
      { findById: vi.fn() } as unknown as BoardsRepository,
      { findById: vi.fn() } as unknown as ColumnsRepository,
      cardsRepo,
      { publish: vi.fn() } as unknown as EventBus,
    );
    await expect(
      handler.execute(new MoveCardCommand('ghost', 'col-b', null, ACCOUNT, ACTOR)),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
