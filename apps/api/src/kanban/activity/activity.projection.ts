import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import {
  BoardCreatedEvent,
  BoardDeletedEvent,
  BoardRenamedEvent,
  CardAssigneeChangedEvent,
  CardCreatedEvent,
  CardDeletedEvent,
  CardLabelAttachedEvent,
  CardLabelDetachedEvent,
  CardMovedEvent,
  CardUpdatedEvent,
  ColumnCreatedEvent,
  ColumnDeletedEvent,
  ColumnMovedEvent,
  ColumnRenamedEvent,
} from '../events/kanban.events';
import { ActivityRepository } from '../repositories/activity.repository';

type DomainEvent =
  | BoardCreatedEvent
  | BoardRenamedEvent
  | BoardDeletedEvent
  | ColumnCreatedEvent
  | ColumnRenamedEvent
  | ColumnMovedEvent
  | ColumnDeletedEvent
  | CardCreatedEvent
  | CardUpdatedEvent
  | CardMovedEvent
  | CardDeletedEvent
  | CardLabelAttachedEvent
  | CardLabelDetachedEvent
  | CardAssigneeChangedEvent;

function getBoardId(event: DomainEvent): string {
  if (event instanceof BoardCreatedEvent || event instanceof BoardRenamedEvent)
    return event.board.id;
  if (event instanceof BoardDeletedEvent) return event.boardId;
  return event.boardId;
}

@EventsHandler(
  BoardCreatedEvent,
  BoardRenamedEvent,
  BoardDeletedEvent,
  ColumnCreatedEvent,
  ColumnRenamedEvent,
  ColumnMovedEvent,
  ColumnDeletedEvent,
  CardCreatedEvent,
  CardUpdatedEvent,
  CardMovedEvent,
  CardDeletedEvent,
  CardLabelAttachedEvent,
  CardLabelDetachedEvent,
  CardAssigneeChangedEvent,
)
export class ActivityProjection implements IEventHandler<DomainEvent> {
  constructor(private readonly activityRepo: ActivityRepository) {}

  async handle(event: DomainEvent): Promise<void> {
    const boardId = getBoardId(event);
    const type = event.constructor.name;
    await this.activityRepo.insert({ boardId, actorId: event.actorId, type, data: {} });
  }
}
