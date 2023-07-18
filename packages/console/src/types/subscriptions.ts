import { z } from 'zod';

import { type SubscriptionPlanResponse } from '@/cloud/types/router';

export enum ReservedPlanName {
  Free = 'Free',
  Hobby = 'Hobby',
  Pro = 'Pro',
  Enterprise = 'Enterprise',
}

export type SubscriptionPlanQuota = SubscriptionPlanResponse['quota'] & {
  communitySupportEnabled: boolean;
  ticketSupportResponseTime: number;
};

export type SubscriptionPlan = Omit<SubscriptionPlanResponse, 'quota'> & {
  quota: SubscriptionPlanQuota;
};

export type SubscriptionPlanTable = Partial<
  SubscriptionPlanQuota & {
    basePrice: string;
    mauUnitPrice: string[];
  }
>;

export type SubscriptionPlanTableData = Pick<SubscriptionPlanResponse, 'id' | 'name'> & {
  table: SubscriptionPlanTable;
};

export enum SubscriptionPlanTableGroupKey {
  base = 'base',
  applications = 'applications',
  resources = 'resources',
  branding = 'branding',
  userAuthentication = 'userAuthentication',
  roles = 'roles',
  auditLogs = 'auditLogs',
  hooks = 'hooks',
  support = 'support',
}

export type SubscriptionPlanTableGroupKeyMap = {
  [key in SubscriptionPlanTableGroupKey]: Array<keyof Required<SubscriptionPlanTable>>;
};

type SubscriptionPlanTableValue = SubscriptionPlanTable[keyof SubscriptionPlanTable];

export type SubscriptionPlanTableRow = Record<string, SubscriptionPlanTableValue> & {
  quotaKey: keyof SubscriptionPlanTable;
};

export const localCheckoutSessionGuard = z.object({
  state: z.string(),
  sessionId: z.string(),
  callbackPage: z.string().optional(),
  isDowngrade: z.boolean().optional(),
});

export type LocalCheckoutSession = z.infer<typeof localCheckoutSessionGuard>;
