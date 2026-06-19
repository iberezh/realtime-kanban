import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { AccountsRepository } from '../billing/accounts.repository';
import { PLAN_LIMITS, planOf } from '../billing/plan.limits';
import type { ShareLink } from '../database/schema';
import { BoardsRepository } from '../kanban/repositories/boards.repository';
import { CreateShareLinkCommand, RevokeShareLinkCommand } from './share.commands';
import { generateShareToken } from './share.token';
import { ShareLinkRepository } from './share-link.repository';

@CommandHandler(CreateShareLinkCommand)
export class CreateShareLinkHandler implements ICommandHandler<CreateShareLinkCommand, ShareLink> {
  constructor(
    private readonly boards: BoardsRepository,
    private readonly accounts: AccountsRepository,
    private readonly shareLinks: ShareLinkRepository,
  ) {}

  async execute(command: CreateShareLinkCommand): Promise<ShareLink> {
    const board = await this.boards.findById(command.boardId);
    if (!board) {
      throw new NotFoundException(`Board ${command.boardId} not found`);
    }
    if (board.accountId !== command.accountId) {
      throw new ForbiddenException();
    }
    const plan = planOf(await this.accounts.findById(command.accountId));
    if (!PLAN_LIMITS[plan].guestLinks) {
      throw new ForbiddenException('Guest links are a Pro feature — upgrade to share boards.');
    }
    return this.shareLinks.create({
      boardId: board.id,
      token: generateShareToken(),
      createdBy: command.userId,
      expiresAt: command.expiresAt,
    });
  }
}

@CommandHandler(RevokeShareLinkCommand)
export class RevokeShareLinkHandler implements ICommandHandler<RevokeShareLinkCommand, void> {
  constructor(
    private readonly boards: BoardsRepository,
    private readonly shareLinks: ShareLinkRepository,
  ) {}

  async execute(command: RevokeShareLinkCommand): Promise<void> {
    const link = await this.shareLinks.findById(command.shareLinkId);
    if (!link) {
      throw new NotFoundException('Share link not found');
    }
    // Authorize through the board's account before revoking.
    const board = await this.boards.findById(link.boardId);
    if (!board || board.accountId !== command.accountId) {
      throw new ForbiddenException();
    }
    await this.shareLinks.delete(link.id);
  }
}
