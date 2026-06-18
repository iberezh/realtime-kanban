import type { Label } from '../database/schema';

export class LabelCreatedEvent {
  constructor(
    public readonly label: Label,
    public readonly actorId: string,
  ) {}
}
export class LabelRenamedEvent {
  constructor(
    public readonly label: Label,
    public readonly actorId: string,
  ) {}
}
export class LabelDeletedEvent {
  constructor(
    public readonly labelId: string,
    public readonly accountId: string,
    public readonly actorId: string,
  ) {}
}
