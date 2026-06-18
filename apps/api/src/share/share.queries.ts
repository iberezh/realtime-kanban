export class ListBoardShareLinksQuery {
  constructor(
    public readonly boardId: string,
    public readonly accountId: string,
  ) {}
}

export class ResolveShareLinkQuery {
  constructor(public readonly token: string) {}
}
