import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { CardAssigneeChangedEvent } from '../events/kanban.events';
import { BoardsRepository } from '../repositories/boards.repository';
import { CardsRepository } from '../repositories/cards.repository';
import { MembersRepository } from '../repositories/members.repository';
import { SetCardAssigneeCommand } from './assignee.commands';

@CommandHandler(SetCardAssigneeCommand)
export class SetCardAssigneeHandler implements ICommandHandler<SetCardAssigneeCommand, void> {
  constructor(
    private readonly cards: CardsRepository,
    private readonly boards: BoardsRepository,
    private readonly members: MembersRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: SetCardAssigneeCommand): Promise<void> {
    const card = await this.cards.findById(command.cardId);
    if (!card) throw new NotFoundException(`Card ${command.cardId} not found`);

    const board = await this.boards.findByColumnId(card.columnId);
    if (!board) throw new NotFoundException('Board not found');
    if (board.accountId !== command.accountId) throw new ForbiddenException();

    if (command.assigneeId !== null) {
      const isMember = await this.members.isMember(command.accountId, command.assigneeId);
      if (!isMember) {
        throw new UnprocessableEntityException(
          `User ${command.assigneeId} is not a member of this workspace`,
        );
      }
    }

    const updated = await this.cards.update(command.cardId, { assigneeId: command.assigneeId });
    if (!updated) throw new NotFoundException(`Card ${command.cardId} not found`);
    this.eventBus.publish(new CardAssigneeChangedEvent(board.id, updated, command.actorId));
  }
}
