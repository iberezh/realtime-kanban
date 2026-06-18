export class ListCardCommentsQuery {
  constructor(
    public readonly cardId: string,
    public readonly accountId: string,
  ) {}
}
