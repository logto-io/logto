import { z } from 'zod';

import { type InvoicesResponse, type SubscriptionPlanResponse } from '@/cloud/types/router';

export enum ReservedPlanName {
  Free = 'Free',
  Hobby = 'Hobby',
  Pro = 'Pro',
  Enterprise = 'Enterprise',
}

export type SubscriptionPlanQuota = Omit<
  SubscriptionPlanResponse['quota'],
  'builtInEmailConnectorEnabled'
> & {
  // Support
  communitySupportEnabled: boolean;
  ticketSupportResponseTime: number;
  // Organization
  organizationEnabled: boolean;
  // SSO
  ssoEnabled: boolean;
};

export type SubscriptionPlan = Omit<SubscriptionPlanResponse, 'quota'> & {
  quota: SubscriptionPlanQuota;
};

export type SubscriptionPlanTable = Partial<
  SubscriptionPlanQuota & {
    // Base quota
    basePrice: string;
    mauUnitPrice: string[];
    // UI and branding
    customCssEnabled: boolean;
    appLogoAndFaviconEnabled: boolean;
    darkModeEnabled: boolean;
    i18nEnabled: boolean;
    // User authn
    passwordSignInEnabled: boolean;
    passwordlessSignInEnabled: boolean;
    emailConnectorsEnabled: boolean;
    smsConnectorsEnabled: boolean;
    // User management
    userManagementEnabled: boolean;
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
  organization = 'organization',
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

export type InvoiceStatus = InvoicesResponse['invoices'][number]['status'];
