import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccountsRepository } from './accounts.repository';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { BILLING_PROVIDER, type BillingProvider } from './billing.types';
import { MockBillingProvider } from './mock-billing.provider';
import { StripeBillingProvider } from './stripe-billing.provider';

@Module({
  controllers: [BillingController],
  providers: [
    AccountsRepository,
    BillingService,
    {
      provide: BILLING_PROVIDER,
      inject: [ConfigService, AccountsRepository],
      // No Stripe key → keyless mock, so the app runs in CI/Docker/local without secrets.
      useFactory: (config: ConfigService, accounts: AccountsRepository): BillingProvider =>
        config.get<string>('STRIPE_SECRET_KEY')
          ? new StripeBillingProvider(accounts, config)
          : new MockBillingProvider(accounts, config),
    },
  ],
  exports: [AccountsRepository],
})
export class BillingModule {}
