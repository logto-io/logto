import { z } from 'zod';

import { type InvoicesResponse } from '@/cloud/types/router';

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
  Development = 'dev',
  Admin = 'admin',
  Enterprise = 'enterprise',
}

export const localCheckoutSessionGuard = z.object({
  state: z.string(),
  sessionId: z.string(),
  callbackPage: z.string().optional(),
  isDowngrade: z.boolean().optional(),
});

export type LocalCheckoutSession = z.infer<typeof localCheckoutSessionGuard>;

export type InvoiceStatus = InvoicesResponse['invoices'][number]['status'];
