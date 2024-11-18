import { z } from 'zod';

import { type InvoicesResponse } from '@/cloud/types/router';

export enum ReservedPlanName {
  Free = 'Free',
  Pro = 'Pro',
}

export const localCheckoutSessionGuard = z.object({
  state: z.string(),
  sessionId: z.string(),
  callbackPage: z.string().optional(),
  isDowngrade: z.boolean().optional(),
});

export type LocalCheckoutSession = z.infer<typeof localCheckoutSessionGuard>;

export type InvoiceStatus = InvoicesResponse['invoices'][number]['status'];
