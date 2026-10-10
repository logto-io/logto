import { selfHostedPlanIds } from '@logto/schemas';
import { z } from 'zod';

/**
 * Wire contract for the account-level read API. Keep in sync with Cloud's
 * `me/self-hosted-licenses` response until its standalone router is published in @logto/cloud.
 */
export const selfHostedLicenseSummaryGuard = z.object({
  id: z.string(),
  plan: z.enum(selfHostedPlanIds),
  status: z.enum(['pending', 'active', 'revoked']),
  subscriptionStatus: z.string().nullable(),
  cancelAtPeriodEnd: z.boolean(),
  currentPeriodEnd: z.string().datetime().nullable(),
  lastRefreshedAt: z.string().datetime().nullable(),
  keyUnavailableReason: z.enum(['canceled', 'unpaid', 'expired', 'revoked']).nullable(),
});

export const selfHostedLicenseDetailsGuard = selfHostedLicenseSummaryGuard.extend({
  productionKey: z.string().optional(),
  nonProductionKey: z.string().optional(),
});

export type SelfHostedLicenseSummary = z.infer<typeof selfHostedLicenseSummaryGuard>;
