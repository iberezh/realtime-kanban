import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { type Database, DRIZZLE } from '../database/database.module';
import { type Account, accounts, memberships, type User, users } from '../database/schema';

export interface CreateUserWithWorkspaceInput {
  email: string;
  passwordHash: string;
  name: string;
  color: string;
  accountName: string;
}

export interface UserWithMembership {
  user: User;
  account: Account;
  role: 'owner' | 'member';
}

export interface MembershipRef {
  accountId: string;
  role: 'owner' | 'member';
}

@Injectable()
export class AuthRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async findUserByEmail(email: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email));
    return user ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user ?? null;
  }

  async findAccountById(id: string): Promise<Account | null> {
    const [account] = await this.db.select().from(accounts).where(eq(accounts.id, id));
    return account ?? null;
  }

  async createUserWithWorkspace(input: CreateUserWithWorkspaceInput): Promise<UserWithMembership> {
    return this.db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          email: input.email,
          passwordHash: input.passwordHash,
          name: input.name,
          color: input.color,
        })
        .returning();

      if (!user) throw new Error('User insert returned no row');

      const [account] = await tx.insert(accounts).values({ name: input.accountName }).returning();

      if (!account) throw new Error('Account insert returned no row');

      await tx.insert(memberships).values({
        userId: user.id,
        accountId: account.id,
        role: 'owner',
      });

      return { user, account, role: 'owner' as const };
    });
  }

  async findMembershipByUser(userId: string): Promise<MembershipRef | null> {
    const [row] = await this.db
      .select({ accountId: memberships.accountId, role: memberships.role })
      .from(memberships)
      .where(eq(memberships.userId, userId));
    return row ?? null;
  }
}
