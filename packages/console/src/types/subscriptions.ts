import { z } from 'zod';

import { type InvoicesResponse, type SubscriptionPlanResponse } from '@/cloud/types/router';

export enum ReservedPlanName {
  Free = 'Free',
  /** @deprecated */
  Hobby = 'Hobby',
  Pro = 'Pro',
  Enterprise = 'Enterprise',
}

// TODO: use `ReservedPlanId` in the future.
export enum ReservedSkuId {
  Free = 'free',
  Pro = 'pro',
  Enterprise = 'enterprise',
}

export type SubscriptionPlanQuota = Omit<
  SubscriptionPlanResponse['quota'],
  'builtInEmailConnectorEnabled'
> & {
  // Add ticket support quota item to the plan since it will be compared in the downgrade plan notification modal.
  ticketSupportResponseTime: number;
};

export type SubscriptionPlanQuotaEntries = Array<
  [keyof SubscriptionPlanQuota, SubscriptionPlanQuota[keyof SubscriptionPlanQuota]]
>;

export type SubscriptionPlan = Omit<SubscriptionPlanResponse, 'quota'> & {
  quota: SubscriptionPlanQuota;
};

export const localCheckoutSessionGuard = z.object({
  state: z.string(),
  sessionId: z.string(),
  callbackPage: z.string().optional(),
  isDowngrade: z.boolean().optional(),
});

export type LocalCheckoutSession = z.infer<typeof localCheckoutSessionGuard>;

export type InvoiceStatus = InvoicesResponse['invoices'][number]['status'];
