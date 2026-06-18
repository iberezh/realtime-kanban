import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { type Database, DRIZZLE } from '../../database/database.module';
import { memberships, users } from '../../database/schema';

export interface MemberView {
  userId: string;
  name: string;
  color: string;
  role: 'owner' | 'member';
}

@Injectable()
export class MembersRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async listByAccount(accountId: string): Promise<MemberView[]> {
    const rows = await this.db
      .select({
        userId: memberships.userId,
        name: users.name,
        color: users.color,
        role: memberships.role,
      })
      .from(memberships)
      .innerJoin(users, eq(memberships.userId, users.id))
      .where(eq(memberships.accountId, accountId));
    return rows;
  }

  async isMember(accountId: string, userId: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: memberships.id })
      .from(memberships)
      .where(and(eq(memberships.accountId, accountId), eq(memberships.userId, userId)))
      .limit(1);
    return rows.length > 0;
  }
}
