import { type ToZodObject } from '@logto/connector-kit';
import { z } from 'zod';

import { type SubscriptionUsage } from '#src/utils/subscription/types.js';

/**
 * TenantUsage type that is based on SubscriptionUsage but with specific fields omitted
 * Note: Although we use z.string().transform(Number) in the guard, the actual type is still number
 * because the transform function converts the string input to number output
 */
export type TenantUsage = Omit<
  SubscriptionUsage,
  'socialConnectorsLimit' | 'subjectTokenEnabled' | 'tenantMembersLimit'
>;

/**
 * Guard for TenantUsage that accepts string inputs and transforms them to numbers
 * This is why we use z.string().transform(Number) instead of z.number()
 */
export const tenantUsageGuard = z.object({
  applicationsLimit: z.string().transform(Number),
  thirdPartyApplicationsLimit: z.string().transform(Number),
  scopesPerResourceLimit: z.string().transform(Number),
  userRolesLimit: z.string().transform(Number),
  machineToMachineRolesLimit: z.string().transform(Number),
  scopesPerRoleLimit: z.string().transform(Number),
  hooksLimit: z.string().transform(Number),
  customJwtEnabled: z.boolean(),
  bringYourUiEnabled: z.boolean(),
  /** Add-on quotas start */
  machineToMachineLimit: z.string().transform(Number),
  resourcesLimit: z.string().transform(Number),
  enterpriseSsoLimit: z.string().transform(Number),
  mfaEnabled: z.boolean(),
  organizationsLimit: z.string().transform(Number),
  /** Enterprise only add-on quotas */
  idpInitiatedSsoEnabled: z.boolean(),
  samlApplicationsLimit: z.string().transform(Number),
  /** Add-on quotas end */
}); // Type assertion to specify input type as string

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
  /** Enterprise only add-on quotas */
  idpInitiatedSsoEnabled: z.boolean(),
  samlApplicationsLimit: z.number(),
  /** Add-on quotas end */
}) satisfies ToZodObject<SelfComputedTenantUsage>;
