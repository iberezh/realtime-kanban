import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { LabelsRepository } from '../../labels/labels.repository';
import { CardLabelAttachedEvent, CardLabelDetachedEvent } from '../events/kanban.events';
import { BoardsRepository } from '../repositories/boards.repository';
import { CardLabelsRepository } from '../repositories/card-labels.repository';
import { CardsRepository } from '../repositories/cards.repository';
import { authorizeCardOnAccount } from './authorize-card';
import { AttachLabelCommand, DetachLabelCommand } from './card-label.commands';

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
