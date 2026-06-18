import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AccountsRepository } from './accounts.repository';
import {
  BILLING_PROVIDER,
  type BillingProvider,
  type BillingStatus,
  type CheckoutResult,
  type PaidPlan,
} from './billing.types';
import { PLAN_LIMITS, planOf } from './plan.limits';

@Injectable()
export class BillingService {
  constructor(
    @Inject(BILLING_PROVIDER) private readonly provider: BillingProvider,
    private readonly accounts: AccountsRepository,
  ) {}

  private async require(accountId: string) {
    const account = await this.accounts.findById(accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async status(accountId: string): Promise<BillingStatus> {
    const account = await this.require(accountId);
    const plan = planOf(account);
    const boards = await this.accounts.countBoards(accountId);
    return { plan, mode: this.provider.mode, limits: PLAN_LIMITS[plan], usage: { boards } };
  }

  async checkout(accountId: string, plan: PaidPlan): Promise<CheckoutResult> {
    return this.provider.checkout(await this.require(accountId), plan);
  }

  async portal(accountId: string): Promise<CheckoutResult> {
    return this.provider.portal(await this.require(accountId));
  }

  handleWebhook(rawBody: Buffer, signature: string | undefined): Promise<void> {
    return this.provider.handleWebhook(rawBody, signature);
  }
}
