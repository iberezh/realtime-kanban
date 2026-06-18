export class CreateBoardCommand {
  constructor(
    public readonly title: string,
    public readonly accountId: string,
  ) {}
}

export class RenameBoardCommand {
  constructor(
    public readonly boardId: string,
    public readonly title: string,
    public readonly accountId: string,
  ) {}
}

export class DeleteBoardCommand {
  constructor(
    public readonly boardId: string,
    public readonly accountId: string,
  ) {}
}
