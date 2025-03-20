import { type ToZodObject } from '@logto/connector-kit';
import { z } from 'zod';

import { type SubscriptionUsage } from '#src/utils/subscription/types.js';

/**
 * A generic type that converts all number properties in T to type V
 */
type ConvertNumberProperties<T, V> = {
  [K in keyof T]: T[K] extends number ? V : T[K];
};

/**
 * TenantUsage type that converts all number properties in SubscriptionUsage to string
 */
export type TenantUsage = Omit<
  ConvertNumberProperties<SubscriptionUsage, string>,
  'socialConnectorsLimit' | 'subjectTokenEnabled' | 'tenantMembersLimit'
>;

/**
 * Guard for TenantUsage that uses string validators for all number properties
 */
export const tenantUsageGuard = z.object({
  applicationsLimit: z.string(),
  thirdPartyApplicationsLimit: z.string(),
  scopesPerResourceLimit: z.string(),
  // SocialConnectorsLimit: z.string(),
  userRolesLimit: z.string(),
  machineToMachineRolesLimit: z.string(),
  scopesPerRoleLimit: z.string(),
  hooksLimit: z.string(),
  customJwtEnabled: z.boolean(),
  // SubjectTokenEnabled: z.boolean(),
  bringYourUiEnabled: z.boolean(),
  /** Add-on quotas start */
  machineToMachineLimit: z.string(),
  resourcesLimit: z.string(),
  enterpriseSsoLimit: z.string(),
  // TenantMembersLimit: z.string(),
  mfaEnabled: z.boolean(),
  organizationsLimit: z.string(),
  /** Enterprise only add-on quotas */
  idpInitiatedSsoEnabled: z.boolean(),
  samlApplicationsLimit: z.string(),
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
  /** Enterprise only add-on quotas */
  idpInitiatedSsoEnabled: z.boolean(),
  samlApplicationsLimit: z.number(),
  /** Add-on quotas end */
}) satisfies ToZodObject<SelfComputedTenantUsage>;
