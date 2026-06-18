import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import type { Account } from '../database/schema';
import { AccountsRepository } from './accounts.repository';
import type { BillingProvider, CheckoutResult, PaidPlan } from './billing.types';
import type { Plan } from './plan.limits';

/** The stripe v22 default export is a constructor; instance + event types are derived from it. */
type StripeClient = Stripe.Stripe;
type StripeEvent = ReturnType<StripeClient['webhooks']['constructEvent']>;

@Injectable()
export class StripeBillingProvider implements BillingProvider {
  readonly mode = 'stripe' as const;
  private readonly stripe: StripeClient;

  constructor(
    private readonly accounts: AccountsRepository,
    private readonly config: ConfigService,
  ) {
    this.stripe = new Stripe(config.getOrThrow<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2026-05-27.dahlia',
    });
  }

  private appUrl(): string {
    return this.config.get<string>('APP_URL') ?? this.config.getOrThrow<string>('CORS_ORIGIN');
  }

  private priceId(plan: PaidPlan): string {
    return this.config.getOrThrow<string>(
      plan === 'pro' ? 'STRIPE_PRICE_PRO' : 'STRIPE_PRICE_BUSINESS',
    );
  }

  private planForPrice(priceId: string | undefined): Plan {
    if (priceId === this.config.get<string>('STRIPE_PRICE_BUSINESS')) return 'business';
    if (priceId === this.config.get<string>('STRIPE_PRICE_PRO')) return 'pro';
    return 'free';
  }

  private async customerFor(account: Account): Promise<string> {
    if (account.stripeCustomerId) return account.stripeCustomerId;
    const customer = await this.stripe.customers.create({
      name: account.name,
      metadata: { accountId: account.id },
    });
    await this.accounts.setStripeCustomerId(account.id, customer.id);
    return customer.id;
  }

  async checkout(account: Account, plan: PaidPlan): Promise<CheckoutResult> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: await this.customerFor(account),
      line_items: [{ price: this.priceId(plan), quantity: 1 }],
      client_reference_id: account.id,
      metadata: { accountId: account.id, plan },
      success_url: `${this.appUrl()}/app?billing=success`,
      cancel_url: `${this.appUrl()}/app?billing=cancelled`,
    });
    if (!session.url) throw new Error('Stripe returned no checkout URL');
    return { url: session.url };
  }

  async portal(account: Account): Promise<CheckoutResult> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: await this.customerFor(account),
      return_url: `${this.appUrl()}/app`,
    });
    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string | undefined): Promise<void> {
    if (!signature) throw new BadRequestException('Missing Stripe signature');
    const secret = this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
    let event: StripeEvent;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch {
      throw new BadRequestException('Invalid Stripe signature');
    }
    await this.applyEvent(event);
  }

  private async applyEvent(event: StripeEvent): Promise<void> {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object;
      const accountId = s.client_reference_id ?? s.metadata?.accountId;
      const plan = s.metadata?.plan as Plan | undefined;
      if (accountId && plan) {
        await this.accounts.setSubscription(accountId, {
          plan,
          subscriptionId: typeof s.subscription === 'string' ? s.subscription : '',
        });
      }
      return;
    }
    if (
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      const sub = event.data.object;
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
      const account = await this.accounts.findByStripeCustomerId(customerId);
      if (!account) return;
      const active = event.type === 'customer.subscription.updated' && sub.status === 'active';
      await this.accounts.setPlan(
        account.id,
        active ? this.planForPrice(sub.items.data[0]?.price.id) : 'free',
      );
    }
  }
}
