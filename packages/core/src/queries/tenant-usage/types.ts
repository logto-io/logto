import { type ToZodObject } from '@logto/connector-kit';
import { z } from 'zod';

import { type SubscriptionUsage } from '#src/utils/subscription/types.js';

/**
 * TenantUsage type that is based on SubscriptionUsage but with specific fields omitted
 */
type TenantUsage = Omit<
  SubscriptionUsage,
  'socialConnectorsLimit' | 'subjectTokenEnabled' | 'tenantMembersLimit'
>;

export const tenantUsageGuard = z.object({
  applicationsLimit: z.number(),
  thirdPartyApplicationsLimit: z.number(),
  scopesPerResourceLimit: z.number(),
  userRolesLimit: z.number(),
  machineToMachineRolesLimit: z.number(),
  scopesPerRoleLimit: z.number(),
  hooksLimit: z.number(),
  customJwtEnabled: z.boolean(),
  bringYourUiEnabled: z.boolean(),
  /** Add-on quotas start */
  machineToMachineLimit: z.number(),
  resourcesLimit: z.number(),
  enterpriseSsoLimit: z.number(),
  mfaEnabled: z.boolean(),
  organizationsLimit: z.number(),
  securityFeaturesEnabled: z.boolean(),
  /** Enterprise only add-on quotas */
  idpInitiatedSsoEnabled: z.boolean(),
  samlApplicationsLimit: z.number(),
  /** Add-on quotas end */
}) satisfies ToZodObject<TenantUsage>;

export type SelfComputedTenantUsage = Omit<SubscriptionUsage, 'tenantMembersLimit'>;

/**
 * Guard for SubscriptionUsage that uses number validators for all number properties
 */
export const selfComputedSubscriptionUsageGuard = z.object({
  applicationsLimit: z.number(),
  thirdPartyApplicationsLimit: z.number(),
  scopesPerResourceLimit: z.number(),
  socialConnectorsLimit: z.number(),
  userRolesLimit: z.number(),
  machineToMachineRolesLimit: z.number(),
  scopesPerRoleLimit: z.number(),
  hooksLimit: z.number(),
  customJwtEnabled: z.boolean(),
  subjectTokenEnabled: z.boolean(),
  bringYourUiEnabled: z.boolean(),
  /** Add-on quotas start */
  machineToMachineLimit: z.number(),
  resourcesLimit: z.number(),
  enterpriseSsoLimit: z.number(),
  mfaEnabled: z.boolean(),
  organizationsLimit: z.number(),
  securityFeaturesEnabled: z.boolean(),
  /** Enterprise only add-on quotas */
  idpInitiatedSsoEnabled: z.boolean(),
  samlApplicationsLimit: z.number(),
  /** Add-on quotas end */
}) satisfies ToZodObject<SelfComputedTenantUsage>;
