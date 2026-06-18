import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import type { Label } from '../database/schema';
import { CreateLabelCommand, DeleteLabelCommand, RenameLabelCommand } from './label.commands';
import { LabelCreatedEvent, LabelDeletedEvent, LabelRenamedEvent } from './label.events';
import { LabelsRepository } from './labels.repository';

@CommandHandler(CreateLabelCommand)
export class CreateLabelHandler implements ICommandHandler<CreateLabelCommand, Label> {
  constructor(
    private readonly labels: LabelsRepository,
    private readonly eventBus: EventBus,
  ) {}
  async execute(command: CreateLabelCommand): Promise<Label> {
    const label = await this.labels.create({
      accountId: command.accountId,
      name: command.name,
      color: command.color,
    });
    this.eventBus.publish(new LabelCreatedEvent(label, command.actorId));
    return label;
  }
}

@CommandHandler(RenameLabelCommand)
export class RenameLabelHandler implements ICommandHandler<RenameLabelCommand, Label> {
  constructor(
    private readonly labels: LabelsRepository,
    private readonly eventBus: EventBus,
  ) {}
  async execute(command: RenameLabelCommand): Promise<Label> {
    const existing = await this.labels.findById(command.labelId);
    if (!existing) throw new NotFoundException(`Label ${command.labelId} not found`);
    if (existing.accountId !== command.accountId) throw new ForbiddenException();
    const label = await this.labels.rename(command.labelId, command.name);
    if (!label) throw new NotFoundException(`Label ${command.labelId} not found`);
    this.eventBus.publish(new LabelRenamedEvent(label, command.actorId));
    return label;
  }
}

@CommandHandler(DeleteLabelCommand)
export class DeleteLabelHandler implements ICommandHandler<DeleteLabelCommand, void> {
  constructor(
    private readonly labels: LabelsRepository,
    private readonly eventBus: EventBus,
  ) {}
  async execute(command: DeleteLabelCommand): Promise<void> {
    const existing = await this.labels.findById(command.labelId);
    if (!existing) throw new NotFoundException(`Label ${command.labelId} not found`);
    if (existing.accountId !== command.accountId) throw new ForbiddenException();
    await this.labels.delete(command.labelId);
    this.eventBus.publish(
      new LabelDeletedEvent(command.labelId, command.accountId, command.actorId),
    );
  }
}
