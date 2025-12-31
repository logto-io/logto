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

/**
 * Forked from `@logto/cloud` package
 *
 * The original enum is defined in the `@logto/cloud` package.
 * However, we do not have direct access to the enum in the console package.
 * So we need to redefine it here.
 */
export enum UsageReportingType {
  TokenUsage = 'tokenUsage',
  MauUsageWithM2MTokens = 'mauUsageWithM2MTokens',
}
