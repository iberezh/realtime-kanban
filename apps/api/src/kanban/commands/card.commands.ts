export class CreateCardCommand {
  constructor(
    public readonly columnId: string,
    public readonly title: string,
    public readonly description: string | null,
  ) {}
}

export class UpdateCardCommand {
  constructor(
    public readonly cardId: string,
    public readonly patch: { title?: string; description?: string | null },
  ) {}
}

/** `beforeCardId` null means "place at the end of the target column". */
export class MoveCardCommand {
  constructor(
    public readonly cardId: string,
    public readonly toColumnId: string,
    public readonly beforeCardId: string | null,
  ) {}
}

export class DeleteCardCommand {
  constructor(public readonly cardId: string) {}
}
