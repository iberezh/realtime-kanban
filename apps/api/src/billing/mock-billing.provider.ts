import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Account } from '../database/schema';
import { AccountsRepository } from './accounts.repository';
import type { BillingProvider, CheckoutResult, PaidPlan } from './billing.types';

/** Keyless fallback used when no Stripe key is configured: flips the plan directly. */
@Injectable()
export class MockBillingProvider implements BillingProvider {
  readonly mode = 'mock' as const;

  constructor(
    private readonly accounts: AccountsRepository,
    private readonly config: ConfigService,
  ) {}

  private appUrl(): string {
    return this.config.get<string>('APP_URL') ?? this.config.getOrThrow<string>('CORS_ORIGIN');
  }

  async checkout(account: Account, plan: PaidPlan): Promise<CheckoutResult> {
    await this.accounts.setPlan(account.id, plan);
    return { url: `${this.appUrl()}/app?billing=success` };
  }

  async portal(): Promise<CheckoutResult> {
    return { url: `${this.appUrl()}/app` };
  }

  async handleWebhook(): Promise<void> {
    // No webhooks in mock mode — checkout applies the plan synchronously.
  }
}
