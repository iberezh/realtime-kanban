export class CreateColumnCommand {
  constructor(
    public readonly boardId: string,
    public readonly title: string,
    public readonly accountId: string,
    public readonly actorId: string,
  ) {}
}
export class RenameColumnCommand {
  constructor(
    public readonly columnId: string,
    public readonly title: string,
    public readonly accountId: string,
    public readonly actorId: string,
  ) {}
}
/** `beforeColumnId` null means "place at the end of the board". */
export class MoveColumnCommand {
  constructor(
    public readonly columnId: string,
    public readonly beforeColumnId: string | null,
    public readonly accountId: string,
    public readonly actorId: string,
  ) {}
}
export class DeleteColumnCommand {
  constructor(
    public readonly columnId: string,
    public readonly accountId: string,
    public readonly actorId: string,
  ) {}
}
