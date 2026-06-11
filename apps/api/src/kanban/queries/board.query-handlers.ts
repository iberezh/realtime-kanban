import { NotFoundException } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { Board } from '../../database/schema';
import { BoardsRepository } from '../repositories/boards.repository';
import { CardsRepository } from '../repositories/cards.repository';
import { ColumnsRepository } from '../repositories/columns.repository';
import { GetBoardQuery, ListBoardsQuery } from './board.queries';
import { assembleBoardView, type BoardView } from './board.views';

@QueryHandler(ListBoardsQuery)
export class ListBoardsHandler implements IQueryHandler<ListBoardsQuery, Board[]> {
  constructor(private readonly boards: BoardsRepository) {}

  async execute(): Promise<Board[]> {
    return this.boards.list();
  }
}

@QueryHandler(GetBoardQuery)
export class GetBoardHandler implements IQueryHandler<GetBoardQuery, BoardView> {
  constructor(
    private readonly boards: BoardsRepository,
    private readonly columns: ColumnsRepository,
    private readonly cards: CardsRepository,
  ) {}

  async execute(query: GetBoardQuery): Promise<BoardView> {
    const board = await this.boards.findById(query.boardId);
    if (!board) {
      throw new NotFoundException(`Board ${query.boardId} not found`);
    }
    const [columns, cards] = await Promise.all([
      this.columns.listByBoard(board.id),
      this.cards.listByBoard(board.id),
    ]);
    return assembleBoardView(board, columns, cards);
  }
}
