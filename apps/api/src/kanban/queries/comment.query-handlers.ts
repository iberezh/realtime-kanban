import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { authorizeCardOnAccount } from '../commands/authorize-card';
import { BoardsRepository } from '../repositories/boards.repository';
import { CardsRepository } from '../repositories/cards.repository';
import type { CommentView } from '../repositories/comments.repository';
import { CommentsRepository } from '../repositories/comments.repository';
import { ListCardCommentsQuery } from './comment.queries';

@QueryHandler(ListCardCommentsQuery)
export class ListCardCommentsHandler
  implements IQueryHandler<ListCardCommentsQuery, CommentView[]>
{
  constructor(
    private readonly cards: CardsRepository,
    private readonly boards: BoardsRepository,
    private readonly commentsRepo: CommentsRepository,
  ) {}

  async execute(query: ListCardCommentsQuery): Promise<CommentView[]> {
    await authorizeCardOnAccount(this.cards, this.boards, query.cardId, query.accountId);
    return this.commentsRepo.listByCard(query.cardId);
  }
}
