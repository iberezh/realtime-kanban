import { Inject, Injectable } from '@nestjs/common';
import { count, eq } from 'drizzle-orm';
import { type Database, DRIZZLE } from '../database/database.module';
import { type Account, accounts, boards } from '../database/schema';
import type { Plan } from './plan.limits';

@Injectable()
export class AccountsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async findById(id: string): Promise<Account | null> {
    const [account] = await this.db.select().from(accounts).where(eq(accounts.id, id));
    return account ?? null;
  }

  async countBoards(accountId: string): Promise<number> {
    const [row] = await this.db
      .select({ value: count() })
      .from(boards)
      .where(eq(boards.accountId, accountId));
    return row?.value ?? 0;
  }

  async setPlan(accountId: string, plan: Plan): Promise<void> {
    await this.db.update(accounts).set({ plan }).where(eq(accounts.id, accountId));
  }

  async setStripeCustomerId(accountId: string, customerId: string): Promise<void> {
    await this.db
      .update(accounts)
      .set({ stripeCustomerId: customerId })
      .where(eq(accounts.id, accountId));
  }

  async setSubscription(
    accountId: string,
    opts: { plan: Plan; subscriptionId: string },
  ): Promise<void> {
    await this.db
      .update(accounts)
      .set({ plan: opts.plan, stripeSubscriptionId: opts.subscriptionId })
      .where(eq(accounts.id, accountId));
  }

  async findByStripeCustomerId(customerId: string): Promise<Account | null> {
    const [account] = await this.db
      .select()
      .from(accounts)
      .where(eq(accounts.stripeCustomerId, customerId));
    return account ?? null;
  }
}
