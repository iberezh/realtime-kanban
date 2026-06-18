export class CreateShareLinkCommand {
  constructor(
    public readonly boardId: string,
    public readonly accountId: string,
    public readonly userId: string,
  ) {}
}

export class RevokeShareLinkCommand {
  constructor(
    public readonly shareLinkId: string,
    public readonly accountId: string,
  ) {}
}
