import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { AccountsRepository } from '../../billing/accounts.repository';
import { PLAN_LIMITS, planOf } from '../../billing/plan.limits';
import type { Board } from '../../database/schema';
import { BoardCreatedEvent, BoardDeletedEvent, BoardRenamedEvent } from '../events/kanban.events';
import { BoardsRepository } from '../repositories/boards.repository';
import { CreateBoardCommand, DeleteBoardCommand, RenameBoardCommand } from './board.commands';

@CommandHandler(CreateBoardCommand)
export class CreateBoardHandler implements ICommandHandler<CreateBoardCommand, Board> {
  constructor(
    private readonly boards: BoardsRepository,
    private readonly accounts: AccountsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateBoardCommand): Promise<Board> {
    const plan = planOf(await this.accounts.findById(command.accountId));
    const limit = PLAN_LIMITS[plan].boards;
    if ((await this.boards.countByAccount(command.accountId)) >= limit) {
      throw new ForbiddenException(
        `Your ${plan} plan allows ${limit} board${limit === 1 ? '' : 's'}. Upgrade for more.`,
      );
    }
    const board = await this.boards.create(command.title, command.accountId);
    this.eventBus.publish(new BoardCreatedEvent(board, command.actorId));
    return board;
  }
}

@CommandHandler(RenameBoardCommand)
export class RenameBoardHandler implements ICommandHandler<RenameBoardCommand, Board> {
  constructor(
    private readonly boards: BoardsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RenameBoardCommand): Promise<Board> {
    const existing = await this.boards.findById(command.boardId);
    if (!existing) throw new NotFoundException(`Board ${command.boardId} not found`);
    if (existing.accountId !== command.accountId) throw new ForbiddenException();

    const board = await this.boards.rename(command.boardId, command.title);
    if (!board) throw new NotFoundException(`Board ${command.boardId} not found`);

    this.eventBus.publish(new BoardRenamedEvent(board, command.actorId));
    return board;
  }
}

@CommandHandler(DeleteBoardCommand)
export class DeleteBoardHandler implements ICommandHandler<DeleteBoardCommand, void> {
  constructor(
    private readonly boards: BoardsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteBoardCommand): Promise<void> {
    const existing = await this.boards.findById(command.boardId);
    if (!existing) throw new NotFoundException(`Board ${command.boardId} not found`);
    if (existing.accountId !== command.accountId) throw new ForbiddenException();

    const deleted = await this.boards.delete(command.boardId);
    if (!deleted) throw new NotFoundException(`Board ${command.boardId} not found`);

    this.eventBus.publish(new BoardDeletedEvent(command.boardId, command.actorId));
  }
}
