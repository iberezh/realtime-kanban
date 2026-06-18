import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { Label } from '../database/schema';
import { ListLabelsQuery } from './label.queries';
import { LabelsRepository } from './labels.repository';

@QueryHandler(ListLabelsQuery)
export class ListLabelsHandler implements IQueryHandler<ListLabelsQuery, Label[]> {
  constructor(private readonly labels: LabelsRepository) {}
  async execute(query: ListLabelsQuery): Promise<Label[]> {
    return this.labels.listByAccount(query.accountId);
  }
}
