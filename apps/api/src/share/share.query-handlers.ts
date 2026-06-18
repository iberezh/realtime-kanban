import { NotFoundException } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { ShareLink } from '../database/schema';
import { assembleBoardView } from '../kanban/queries/board.views';
import { BoardsRepository } from '../kanban/repositories/boards.repository';
import { CardLabelsRepository } from '../kanban/repositories/card-labels.repository';
import { CardsRepository } from '../kanban/repositories/cards.repository';
import { ColumnsRepository } from '../kanban/repositories/columns.repository';
import { LabelsRepository } from '../labels/labels.repository';
import { ListBoardShareLinksQuery, ResolveShareLinkQuery } from './share.queries';
import type { SharedBoardView } from './share.views';
import { ShareLinkRepository } from './share-link.repository';

@QueryHandler(ListBoardShareLinksQuery)
export class ListBoardShareLinksHandler
  implements IQueryHandler<ListBoardShareLinksQuery, ShareLink[]>
{
  constructor(
    private readonly boards: BoardsRepository,
    private readonly shareLinks: ShareLinkRepository,
  ) {}

  async execute(query: ListBoardShareLinksQuery): Promise<ShareLink[]> {
    const board = await this.boards.findById(query.boardId);
    // Hide existence from non-owners: not-found for both missing and foreign boards.
    if (!board || board.accountId !== query.accountId) {
      throw new NotFoundException(`Board ${query.boardId} not found`);
    }
    return this.shareLinks.listByBoard(board.id);
  }
}

@QueryHandler(ResolveShareLinkQuery)
export class ResolveShareLinkHandler
  implements IQueryHandler<ResolveShareLinkQuery, SharedBoardView>
{
  constructor(
    private readonly shareLinks: ShareLinkRepository,
    private readonly boards: BoardsRepository,
    private readonly columns: ColumnsRepository,
    private readonly cards: CardsRepository,
    private readonly cardLabels: CardLabelsRepository,
    private readonly labels: LabelsRepository,
  ) {}

  async execute(query: ResolveShareLinkQuery): Promise<SharedBoardView> {
    const link = await this.shareLinks.findByToken(query.token);
    const board = link && (await this.boards.findById(link.boardId));
    if (!board) {
      throw new NotFoundException('This share link is no longer active');
    }
    const [cols, cards, cardLabelIds, labels] = await Promise.all([
      this.columns.listByBoard(board.id),
      this.cards.listByBoard(board.id),
      this.cardLabels.labelIdsByBoard(board.id),
      this.labels.listByAccount(board.accountId),
    ]);
    return { ...assembleBoardView(board, cols, cards, cardLabelIds), labels };
  }
}
