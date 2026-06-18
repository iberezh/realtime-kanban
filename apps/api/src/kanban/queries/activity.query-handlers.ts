import { NotFoundException } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { Activity } from '../../database/schema';
import { ActivityRepository } from '../repositories/activity.repository';
import { BoardsRepository } from '../repositories/boards.repository';
import { ListBoardActivityQuery } from './activity.queries';

@QueryHandler(ListBoardActivityQuery)
export class ListBoardActivityHandler implements IQueryHandler<ListBoardActivityQuery, Activity[]> {
  constructor(
    private readonly boards: BoardsRepository,
    private readonly activityRepo: ActivityRepository,
  ) {}

  async execute(query: ListBoardActivityQuery): Promise<Activity[]> {
    const board = await this.boards.findById(query.boardId);
    if (!board || board.accountId !== query.accountId) {
      throw new NotFoundException(`Board ${query.boardId} not found`);
    }
    return this.activityRepo.listByBoard(query.boardId);
  }
}
