import type { Account } from '../database/schema';
import type { Plan, PlanLimits } from './plan.limits';

export type PaidPlan = Exclude<Plan, 'free'>;

export interface CheckoutResult {
  url: string;
}

export interface BillingStatus {
  plan: Plan;
  mode: 'stripe' | 'mock';
  limits: PlanLimits;
  usage: { boards: number };
}

/** Swappable billing backend: real Stripe, or a keyless mock for local/CI runs. */
export interface BillingProvider {
  readonly mode: 'stripe' | 'mock';
  checkout(account: Account, plan: PaidPlan): Promise<CheckoutResult>;
  portal(account: Account): Promise<CheckoutResult>;
  /** Sync the plan from a completed Checkout Session on return, before the webhook lands. */
  confirm(account: Account, sessionId: string): Promise<void>;
  handleWebhook(rawBody: Buffer, signature: string | undefined): Promise<void>;
}

export const BILLING_PROVIDER = Symbol('BILLING_PROVIDER');
