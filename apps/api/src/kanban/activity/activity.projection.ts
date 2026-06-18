import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import {
  BoardCreatedEvent,
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

// BoardDeletedEvent is intentionally not projected: activity is board-scoped and
// cascade-deleted with the board, so a deletion row would be orphaned at once and
// would violate the activity → boards foreign key.
type DomainEvent =
  | BoardCreatedEvent
  | BoardRenamedEvent
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
  if (event instanceof BoardCreatedEvent || event instanceof BoardRenamedEvent) {
    return event.board.id;
  }
  return event.boardId;
}

@EventsHandler(
  BoardCreatedEvent,
  BoardRenamedEvent,
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
