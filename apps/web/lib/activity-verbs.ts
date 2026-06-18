/** Maps a domain event class name to a human verb for the activity feed. */
const VERBS: Record<string, string> = {
  BoardCreatedEvent: 'created the board',
  BoardRenamedEvent: 'renamed the board',
  BoardDeletedEvent: 'deleted the board',
  ColumnCreatedEvent: 'added a column',
  ColumnRenamedEvent: 'renamed a column',
  ColumnMovedEvent: 'moved a column',
  ColumnDeletedEvent: 'removed a column',
  CardCreatedEvent: 'added a card',
  CardUpdatedEvent: 'updated a card',
  CardMovedEvent: 'moved a card',
  CardDeletedEvent: 'removed a card',
  CardLabelAttachedEvent: 'added a label',
  CardLabelDetachedEvent: 'removed a label',
  CardAssigneeChangedEvent: 'changed an assignee',
};

export const activityVerb = (type: string): string => VERBS[type] ?? 'updated the board';
