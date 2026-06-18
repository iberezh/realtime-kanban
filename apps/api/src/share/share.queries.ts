export class ListBoardShareLinksQuery {
  constructor(
    public readonly boardId: string,
    public readonly accountId: string,
  ) {}
}

export class ResolveShareLinkQuery {
  constructor(public readonly token: string) {}
}

/** Resolves a share token to its board id for the realtime guest-join path. */
export class BoardIdForShareTokenQuery {
  constructor(public readonly token: string) {}
}
