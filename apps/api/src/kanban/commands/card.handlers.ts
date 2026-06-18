import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import type { Card } from '../../database/schema';
import {
  CardCreatedEvent,
  CardDeletedEvent,
  CardMovedEvent,
  CardUpdatedEvent,
} from '../events/kanban.events';
import { placementBefore } from '../ranking/placement';
import { rankBetween } from '../ranking/rank';
import { BoardsRepository } from '../repositories/boards.repository';
import { CardsRepository } from '../repositories/cards.repository';
import { ColumnsRepository } from '../repositories/columns.repository';
import {
  CreateCardCommand,
  DeleteCardCommand,
  MoveCardCommand,
  UpdateCardCommand,
} from './card.commands';

@CommandHandler(CreateCardCommand)
export class CreateCardHandler implements ICommandHandler<CreateCardCommand, Card> {
  constructor(
    private readonly boards: BoardsRepository,
    private readonly columns: ColumnsRepository,
    private readonly cards: CardsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateCardCommand): Promise<Card> {
    const column = await this.columns.findById(command.columnId);
    if (!column) throw new NotFoundException(`Column ${command.columnId} not found`);

    const board = await this.boards.findById(column.boardId);
    if (!board || board.accountId !== command.accountId) throw new ForbiddenException();

    const rank = rankBetween(await this.cards.lastRank(column.id), null);
    const card = await this.cards.create({
      columnId: column.id,
      title: command.title,
      description: command.description,
      rank,
    });
    this.eventBus.publish(new CardCreatedEvent(column.boardId, card));
    return card;
  }
}

@CommandHandler(UpdateCardCommand)
export class UpdateCardHandler implements ICommandHandler<UpdateCardCommand, Card> {
  constructor(
    private readonly boards: BoardsRepository,
    private readonly columns: ColumnsRepository,
    private readonly cards: CardsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateCardCommand): Promise<Card> {
    const existing = await this.cards.findById(command.cardId);
    if (!existing) throw new NotFoundException(`Card ${command.cardId} not found`);

    const column = await this.columns.findById(existing.columnId);
    if (!column) throw new NotFoundException(`Column ${existing.columnId} not found`);

    const board = await this.boards.findById(column.boardId);
    if (!board || board.accountId !== command.accountId) throw new ForbiddenException();

    const card = await this.cards.update(command.cardId, command.patch);
    if (!card) throw new NotFoundException(`Card ${command.cardId} not found`);

    this.eventBus.publish(new CardUpdatedEvent(column.boardId, card));
    return card;
  }
}

@CommandHandler(MoveCardCommand)
export class MoveCardHandler implements ICommandHandler<MoveCardCommand, Card> {
  constructor(
    private readonly boards: BoardsRepository,
    private readonly columns: ColumnsRepository,
    private readonly cards: CardsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: MoveCardCommand): Promise<Card> {
    const card = await this.cards.findById(command.cardId);
    if (!card) throw new NotFoundException(`Card ${command.cardId} not found`);

    const source = await this.columns.findById(card.columnId);
    const target = await this.columns.findById(command.toColumnId);
    if (!source || !target) {
      throw new NotFoundException(`Column ${command.toColumnId} not found`);
    }
    if (source.boardId !== target.boardId) {
      throw new BadRequestException('Cards can only move within their board');
    }

    const board = await this.boards.findById(target.boardId);
    if (!board || board.accountId !== command.accountId) throw new ForbiddenException();

    const siblings = (await this.cards.listRanks(target.id)).filter((item) => item.id !== card.id);
    const placement = placementBefore(siblings, command.beforeCardId);
    if (!placement) {
      throw new BadRequestException(`Card ${command.beforeCardId} is not in the target column`);
    }

    const rank = rankBetween(placement.prev, placement.next);
    const moved = await this.cards.move(card.id, target.id, rank);
    if (!moved) throw new NotFoundException(`Card ${command.cardId} not found`);

    this.eventBus.publish(new CardMovedEvent(target.boardId, moved));
    return moved;
  }
}

@CommandHandler(DeleteCardCommand)
export class DeleteCardHandler implements ICommandHandler<DeleteCardCommand, void> {
  constructor(
    private readonly boards: BoardsRepository,
    private readonly columns: ColumnsRepository,
    private readonly cards: CardsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteCardCommand): Promise<void> {
    const card = await this.cards.findById(command.cardId);
    if (!card) throw new NotFoundException(`Card ${command.cardId} not found`);

    const column = await this.columns.findById(card.columnId);
    if (!column) throw new NotFoundException(`Column ${card.columnId} not found`);

    const board = await this.boards.findById(column.boardId);
    if (!board || board.accountId !== command.accountId) throw new ForbiddenException();

    await this.cards.delete(card.id);
    this.eventBus.publish(new CardDeletedEvent(column.boardId, column.id, card.id));
  }
}
