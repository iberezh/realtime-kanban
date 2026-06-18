import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import type { Column } from '../../database/schema';
import {
  ColumnCreatedEvent,
  ColumnDeletedEvent,
  ColumnMovedEvent,
  ColumnRenamedEvent,
} from '../events/kanban.events';
import { placementBefore } from '../ranking/placement';
import { rankBetween } from '../ranking/rank';
import { BoardsRepository } from '../repositories/boards.repository';
import { ColumnsRepository } from '../repositories/columns.repository';
import {
  CreateColumnCommand,
  DeleteColumnCommand,
  MoveColumnCommand,
  RenameColumnCommand,
} from './column.commands';

@CommandHandler(CreateColumnCommand)
export class CreateColumnHandler implements ICommandHandler<CreateColumnCommand, Column> {
  constructor(
    private readonly boards: BoardsRepository,
    private readonly columns: ColumnsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateColumnCommand): Promise<Column> {
    const board = await this.boards.findById(command.boardId);
    if (!board) throw new NotFoundException(`Board ${command.boardId} not found`);
    if (board.accountId !== command.accountId) throw new ForbiddenException();

    const rank = rankBetween(await this.columns.lastRank(board.id), null);
    const column = await this.columns.create({ boardId: board.id, title: command.title, rank });
    this.eventBus.publish(new ColumnCreatedEvent(board.id, column, command.actorId));
    return column;
  }
}

@CommandHandler(RenameColumnCommand)
export class RenameColumnHandler implements ICommandHandler<RenameColumnCommand, Column> {
  constructor(
    private readonly boards: BoardsRepository,
    private readonly columns: ColumnsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RenameColumnCommand): Promise<Column> {
    const existing = await this.columns.findById(command.columnId);
    if (!existing) throw new NotFoundException(`Column ${command.columnId} not found`);

    const board = await this.boards.findById(existing.boardId);
    if (!board || board.accountId !== command.accountId) throw new ForbiddenException();

    const column = await this.columns.rename(command.columnId, command.title);
    if (!column) throw new NotFoundException(`Column ${command.columnId} not found`);

    this.eventBus.publish(new ColumnRenamedEvent(column.boardId, column, command.actorId));
    return column;
  }
}

@CommandHandler(MoveColumnCommand)
export class MoveColumnHandler implements ICommandHandler<MoveColumnCommand, Column> {
  constructor(
    private readonly boards: BoardsRepository,
    private readonly columns: ColumnsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: MoveColumnCommand): Promise<Column> {
    const column = await this.columns.findById(command.columnId);
    if (!column) throw new NotFoundException(`Column ${command.columnId} not found`);

    const board = await this.boards.findById(column.boardId);
    if (!board || board.accountId !== command.accountId) throw new ForbiddenException();

    const siblings = (await this.columns.listRanks(column.boardId)).filter(
      (item) => item.id !== column.id,
    );
    const placement = placementBefore(siblings, command.beforeColumnId);
    if (!placement) {
      throw new BadRequestException(`Column ${command.beforeColumnId} is not on this board`);
    }

    const rank = rankBetween(placement.prev, placement.next);
    const moved = await this.columns.updateRank(column.id, rank);
    if (!moved) throw new NotFoundException(`Column ${command.columnId} not found`);

    this.eventBus.publish(new ColumnMovedEvent(moved.boardId, moved, command.actorId));
    return moved;
  }
}

@CommandHandler(DeleteColumnCommand)
export class DeleteColumnHandler implements ICommandHandler<DeleteColumnCommand, void> {
  constructor(
    private readonly boards: BoardsRepository,
    private readonly columns: ColumnsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteColumnCommand): Promise<void> {
    const column = await this.columns.findById(command.columnId);
    if (!column) throw new NotFoundException(`Column ${command.columnId} not found`);

    const board = await this.boards.findById(column.boardId);
    if (!board || board.accountId !== command.accountId) throw new ForbiddenException();

    await this.columns.delete(column.id);
    this.eventBus.publish(new ColumnDeletedEvent(column.boardId, column.id, command.actorId));
  }
}
