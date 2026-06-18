export class SetCardAssigneeCommand {
  constructor(
    public readonly cardId: string,
    public readonly assigneeId: string | null,
    public readonly accountId: string,
    public readonly actorId: string,
  ) {}
}
