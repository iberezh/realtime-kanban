import { NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import type { ChecklistItem } from '../../database/schema';
import {
  ChecklistItemAddedEvent,
  ChecklistItemDeletedEvent,
  ChecklistItemUpdatedEvent,
} from '../events/kanban.events';
import { rankBetween } from '../ranking/rank';
import { BoardsRepository } from '../repositories/boards.repository';
import { CardsRepository } from '../repositories/cards.repository';
import { ChecklistRepository } from '../repositories/checklist.repository';
import { authorizeCardOnAccount } from './authorize-card';
import {
  AddChecklistItemCommand,
  DeleteChecklistItemCommand,
  UpdateChecklistItemCommand,
} from './checklist.commands';

@CommandHandler(AddChecklistItemCommand)
export class AddChecklistItemHandler
  implements ICommandHandler<AddChecklistItemCommand, ChecklistItem>
{
  constructor(
    private readonly cards: CardsRepository,
    private readonly boards: BoardsRepository,
    private readonly checklist: ChecklistRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AddChecklistItemCommand): Promise<ChecklistItem> {
    const { boardId } = await authorizeCardOnAccount(
      this.cards,
      this.boards,
      command.cardId,
      command.accountId,
    );
    const rank = rankBetween(await this.checklist.lastRank(command.cardId), null);
    const item = await this.checklist.create({ cardId: command.cardId, text: command.text, rank });
    this.eventBus.publish(new ChecklistItemAddedEvent(boardId, item.cardId, item, command.actorId));
    return item;
  }
}

@CommandHandler(UpdateChecklistItemCommand)
export class UpdateChecklistItemHandler
  implements ICommandHandler<UpdateChecklistItemCommand, ChecklistItem>
{
  constructor(
    private readonly cards: CardsRepository,
    private readonly boards: BoardsRepository,
    private readonly checklist: ChecklistRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateChecklistItemCommand): Promise<ChecklistItem> {
    const existing = await this.checklist.findById(command.itemId);
    if (!existing) {
      throw new NotFoundException(`Checklist item ${command.itemId} not found`);
    }
    const { boardId } = await authorizeCardOnAccount(
      this.cards,
      this.boards,
      existing.cardId,
      command.accountId,
    );
    const item = await this.checklist.update(command.itemId, command.patch);
    if (!item) {
      throw new NotFoundException(`Checklist item ${command.itemId} not found`);
    }
    this.eventBus.publish(
      new ChecklistItemUpdatedEvent(boardId, item.cardId, item, command.actorId),
    );
    return item;
  }
}

@CommandHandler(DeleteChecklistItemCommand)
export class DeleteChecklistItemHandler
  implements ICommandHandler<DeleteChecklistItemCommand, void>
{
  constructor(
    private readonly cards: CardsRepository,
    private readonly boards: BoardsRepository,
    private readonly checklist: ChecklistRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteChecklistItemCommand): Promise<void> {
    const existing = await this.checklist.findById(command.itemId);
    if (!existing) {
      throw new NotFoundException(`Checklist item ${command.itemId} not found`);
    }
    const { boardId } = await authorizeCardOnAccount(
      this.cards,
      this.boards,
      existing.cardId,
      command.accountId,
    );
    await this.checklist.delete(command.itemId);
    this.eventBus.publish(
      new ChecklistItemDeletedEvent(boardId, existing.cardId, existing.id, command.actorId),
    );
  }
}
