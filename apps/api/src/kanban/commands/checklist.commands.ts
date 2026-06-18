export class AddChecklistItemCommand {
  constructor(
    public readonly cardId: string,
    public readonly text: string,
    public readonly accountId: string,
    public readonly actorId: string,
  ) {}
}
export class UpdateChecklistItemCommand {
  constructor(
    public readonly itemId: string,
    public readonly patch: { text?: string; done?: boolean },
    public readonly accountId: string,
    public readonly actorId: string,
  ) {}
}
export class DeleteChecklistItemCommand {
  constructor(
    public readonly itemId: string,
    public readonly accountId: string,
    public readonly actorId: string,
  ) {}
}
