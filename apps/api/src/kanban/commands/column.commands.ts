export class CreateColumnCommand {
  constructor(
    public readonly boardId: string,
    public readonly title: string,
  ) {}
}

export class RenameColumnCommand {
  constructor(
    public readonly columnId: string,
    public readonly title: string,
  ) {}
}

/** `beforeColumnId` null means "place at the end of the board". */
export class MoveColumnCommand {
  constructor(
    public readonly columnId: string,
    public readonly beforeColumnId: string | null,
  ) {}
}

export class DeleteColumnCommand {
  constructor(public readonly columnId: string) {}
}
