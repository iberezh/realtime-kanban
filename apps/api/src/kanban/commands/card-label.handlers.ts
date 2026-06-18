import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { LabelsRepository } from '../../labels/labels.repository';
import { CardLabelAttachedEvent, CardLabelDetachedEvent } from '../events/kanban.events';
import { BoardsRepository } from '../repositories/boards.repository';
import { CardLabelsRepository } from '../repositories/card-labels.repository';
import { CardsRepository } from '../repositories/cards.repository';
import { AttachLabelCommand, DetachLabelCommand } from './card-label.commands';

async function authorizeCardOnAccount(
  cards: CardsRepository,
  boards: BoardsRepository,
  cardId: string,
  accountId: string,
): Promise<{ boardId: string }> {
  const card = await cards.findById(cardId);
  if (!card) throw new NotFoundException(`Card ${cardId} not found`);
  const board = await boards.findByColumnId(card.columnId);
  if (!board) throw new NotFoundException('Board not found');
  if (board.accountId !== accountId) throw new ForbiddenException();
  return { boardId: board.id };
}

@CommandHandler(AttachLabelCommand)
export class AttachLabelHandler implements ICommandHandler<AttachLabelCommand, void> {
  constructor(
    private readonly cards: CardsRepository,
    private readonly boards: BoardsRepository,
    private readonly cardLabels: CardLabelsRepository,
    private readonly labels: LabelsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AttachLabelCommand): Promise<void> {
    const { boardId } = await authorizeCardOnAccount(
      this.cards,
      this.boards,
      command.cardId,
      command.accountId,
    );
    const label = await this.labels.findById(command.labelId);
    if (!label) throw new NotFoundException(`Label ${command.labelId} not found`);
    if (label.accountId !== command.accountId) throw new ForbiddenException();
    await this.cardLabels.attach(command.cardId, command.labelId);
    this.eventBus.publish(
      new CardLabelAttachedEvent(boardId, command.cardId, command.labelId, command.actorId),
    );
  }
}

@CommandHandler(DetachLabelCommand)
export class DetachLabelHandler implements ICommandHandler<DetachLabelCommand, void> {
  constructor(
    private readonly cards: CardsRepository,
    private readonly boards: BoardsRepository,
    private readonly cardLabels: CardLabelsRepository,
    private readonly labels: LabelsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DetachLabelCommand): Promise<void> {
    const { boardId } = await authorizeCardOnAccount(
      this.cards,
      this.boards,
      command.cardId,
      command.accountId,
    );
    const label = await this.labels.findById(command.labelId);
    if (!label) throw new NotFoundException(`Label ${command.labelId} not found`);
    if (label.accountId !== command.accountId) throw new ForbiddenException();
    await this.cardLabels.detach(command.cardId, command.labelId);
    this.eventBus.publish(
      new CardLabelDetachedEvent(boardId, command.cardId, command.labelId, command.actorId),
    );
  }
}
