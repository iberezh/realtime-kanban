import { NotFoundException } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AccountsRepository } from '../../billing/accounts.repository';
import { PLAN_LIMITS, planOf } from '../../billing/plan.limits';
import type { Activity } from '../../database/schema';
import { ActivityRepository } from '../repositories/activity.repository';
import { BoardsRepository } from '../repositories/boards.repository';
import { ListBoardActivityQuery } from './activity.queries';

const DAY_MS = 86_400_000;

@QueryHandler(ListBoardActivityQuery)
export class ListBoardActivityHandler implements IQueryHandler<ListBoardActivityQuery, Activity[]> {
  constructor(
    private readonly boards: BoardsRepository,
    private readonly accounts: AccountsRepository,
    private readonly activityRepo: ActivityRepository,
  ) {}

  async execute(query: ListBoardActivityQuery): Promise<Activity[]> {
    const board = await this.boards.findById(query.boardId);
    if (!board || board.accountId !== query.accountId) {
      throw new NotFoundException(`Board ${query.boardId} not found`);
    }
    // Activity history window is plan-gated; unlimited plans see everything.
    const days = PLAN_LIMITS[planOf(await this.accounts.findById(query.accountId))].activityDays;
    const since = Number.isFinite(days) ? new Date(Date.now() - days * DAY_MS) : undefined;
    return this.activityRepo.listByBoard(query.boardId, 50, since);
  }
}
