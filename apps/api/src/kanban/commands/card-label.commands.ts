export class AttachLabelCommand {
  constructor(
    public readonly cardId: string,
    public readonly labelId: string,
    public readonly accountId: string,
    public readonly actorId: string,
  ) {}
}
export class DetachLabelCommand {
  constructor(
    public readonly cardId: string,
    public readonly labelId: string,
    public readonly accountId: string,
    public readonly actorId: string,
  ) {}
}
