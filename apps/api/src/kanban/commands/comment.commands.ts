export class CreateCommentCommand {
  constructor(
    public readonly cardId: string,
    public readonly body: string,
    public readonly mentionedUserIds: string[],
    public readonly accountId: string,
    public readonly userId: string,
  ) {}
}

export class DeleteCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly accountId: string,
    public readonly userId: string,
  ) {}
}
