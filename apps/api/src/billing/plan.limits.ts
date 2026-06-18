export type Plan = 'free' | 'pro' | 'business';

export interface PlanLimits {
  boards: number;
  activityDays: number;
  guestLinks: boolean;
  customLabels: boolean;
}

/** An account's plan, defaulting to the most restrictive tier when unknown. */
export const planOf = (account: { plan: string } | null): Plan => (account?.plan ?? 'free') as Plan;

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: { boards: 1, activityDays: 1, guestLinks: false, customLabels: false },
  pro: { boards: 3, activityDays: 14, guestLinks: true, customLabels: true },
  business: {
    boards: Number.POSITIVE_INFINITY,
    activityDays: Number.POSITIVE_INFINITY,
    guestLinks: true,
    customLabels: true,
  },
};
