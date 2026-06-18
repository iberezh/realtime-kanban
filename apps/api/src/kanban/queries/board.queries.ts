export class ListBoardsQuery {
  constructor(public readonly accountId: string) {}
}

export class GetBoardQuery {
  constructor(
    public readonly boardId: string,
    public readonly accountId: string,
  ) {}
}
