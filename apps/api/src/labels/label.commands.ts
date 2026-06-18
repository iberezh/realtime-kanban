export class CreateLabelCommand {
  constructor(
    public readonly accountId: string,
    public readonly actorId: string,
    public readonly name: string,
    public readonly color: string,
  ) {}
}
export class RenameLabelCommand {
  constructor(
    public readonly labelId: string,
    public readonly accountId: string,
    public readonly actorId: string,
    public readonly name: string,
  ) {}
}
export class DeleteLabelCommand {
  constructor(
    public readonly labelId: string,
    public readonly accountId: string,
    public readonly actorId: string,
  ) {}
}
