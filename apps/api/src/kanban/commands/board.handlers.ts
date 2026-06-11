import { NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import type { Board } from '../../database/schema';
import { BoardCreatedEvent, BoardDeletedEvent, BoardRenamedEvent } from '../events/kanban.events';
import { BoardsRepository } from '../repositories/boards.repository';
import { CreateBoardCommand, DeleteBoardCommand, RenameBoardCommand } from './board.commands';

@CommandHandler(CreateBoardCommand)
export class CreateBoardHandler implements ICommandHandler<CreateBoardCommand, Board> {
  constructor(
    private readonly boards: BoardsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateBoardCommand): Promise<Board> {
    const board = await this.boards.create(command.title);
    this.eventBus.publish(new BoardCreatedEvent(board));
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
    const board = await this.boards.rename(command.boardId, command.title);
    if (!board) {
      throw new NotFoundException(`Board ${command.boardId} not found`);
    }
    this.eventBus.publish(new BoardRenamedEvent(board));
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
    const deleted = await this.boards.delete(command.boardId);
    if (!deleted) {
      throw new NotFoundException(`Board ${command.boardId} not found`);
    }
    this.eventBus.publish(new BoardDeletedEvent(command.boardId));
  }
}
