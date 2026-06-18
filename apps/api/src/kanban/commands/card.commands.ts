export class CreateCardCommand {
  constructor(
    public readonly columnId: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly accountId: string,
    public readonly actorId: string,
  ) {}
}
export class UpdateCardCommand {
  constructor(
    public readonly cardId: string,
    public readonly patch: { title?: string; description?: string | null; dueAt?: Date | null },
    public readonly accountId: string,
    public readonly actorId: string,
  ) {}
}
export class MoveCardCommand {
  constructor(
    public readonly cardId: string,
    public readonly toColumnId: string,
    public readonly beforeCardId: string | null,
    public readonly accountId: string,
    public readonly actorId: string,
  ) {}
}
export class DeleteCardCommand {
  constructor(
    public readonly cardId: string,
    public readonly accountId: string,
    public readonly actorId: string,
  ) {}
}
