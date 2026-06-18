import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { BoardsRepository } from '../repositories/boards.repository';
import type { CardsRepository } from '../repositories/cards.repository';

/** Resolves a card to its board and asserts the board belongs to the caller's account. */
export async function authorizeCardOnAccount(
  cards: CardsRepository,
  boards: BoardsRepository,
  cardId: string,
  accountId: string,
): Promise<{ boardId: string }> {
  const card = await cards.findById(cardId);
  if (!card) {
    throw new NotFoundException(`Card ${cardId} not found`);
  }
  const board = await boards.findByColumnId(card.columnId);
  if (!board) {
    throw new NotFoundException('Board not found');
  }
  if (board.accountId !== accountId) {
    throw new ForbiddenException();
  }
  return { boardId: board.id };
}
