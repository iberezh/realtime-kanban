import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { MemberView } from '../repositories/members.repository';
import { MembersRepository } from '../repositories/members.repository';
import { ListMembersQuery } from './members.queries';

@QueryHandler(ListMembersQuery)
export class ListMembersHandler implements IQueryHandler<ListMembersQuery, MemberView[]> {
  constructor(private readonly members: MembersRepository) {}
  async execute(query: ListMembersQuery): Promise<MemberView[]> {
    return this.members.listByAccount(query.accountId);
  }
}
