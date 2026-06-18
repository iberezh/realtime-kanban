import { api, ENDPOINTS } from './api';
import type { BillingStatus } from './types';

export const getBillingStatus = (): Promise<BillingStatus> => api(ENDPOINTS.billingStatus);

export const startCheckout = (plan: 'pro' | 'business'): Promise<{ url: string }> =>
  api(ENDPOINTS.billingCheckout, { method: 'POST', body: JSON.stringify({ plan }) });

export const openPortal = (): Promise<{ url: string }> =>
  api(ENDPOINTS.billingPortal, { method: 'POST' });
