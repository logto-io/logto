import { z } from 'zod';

import { type SystemLimit, type SubscriptionQuota } from '#src/utils/subscription/types.js';
import { type ToZodEnum } from '#src/utils/type.js';

/**
 * Tenant usage quota checking type system
 *
 * Type hierarchy:
 *
 * UsageKey (all keys that need to be checked)
 * ├── SystemUsageKey (system-level limits, all numeric)
 * └── QuotaUsageKey (subscription quota keys, split into two types)
 *     ├── NumericQuotaUsageKey (numeric quotas, e.g., applicationsLimit)
 *     └── BooleanQuotaUsageKey (boolean quotas, e.g., mfaEnabled)
 *
 * NumericUsageKey (keys for fetching numeric usage)
 * = NumericQuotaUsageKey | SystemUsageKey
 * ├── SelfComputedUsageKey (queryable from tenant database)
 * └── socialConnectorsLimit (requires connector library)
 *
 * Design notes:
 * - SystemUsageKey: System admin limits (higher priority)
 * - QuotaUsageKey: Subscription plan quotas (lower priority)
 * - Boolean types are feature toggles, checked directly against quotas
 * - Numeric types require querying current usage to compare against limits
 * - SelfComputed means usage can be directly calculated from the database
 */

/** System-level limit keys checked in core. */
export type SystemUsageKey = Exclude<
  keyof SystemLimit,
  // Excludes `tenantMembersLimit` as it is checked in Cloud, not in core.
  'tenantMembersLimit'
>;

/** Subscription quota keys checked in core. */

export type QuotaUsageKey = Exclude<
  keyof SubscriptionQuota,
  | 'mauLimit'
  | 'tokenLimit'
  // Exclude tenantMembersLimit as it is checked in Cloud, not in core.
  | 'tenantMembersLimit'
>;

/**
 * Shared keys between SystemUsageKey and QuotaUsageKey.
 *
 * Used for type guards to ensure manual updates when keys are added/removed
 * from SystemLimit or SubscriptionQuota.
 */
type SharedUsageKey = QuotaUsageKey & SystemUsageKey;

const sharedUsageKeyGuard = z.enum([
  'applicationsLimit',
  'thirdPartyApplicationsLimit',
  'scopesPerResourceLimit',
  'socialConnectorsLimit',
  'userRolesLimit',
  'machineToMachineRolesLimit',
  'scopesPerRoleLimit',
  'hooksLimit',
  'machineToMachineLimit',
  'resourcesLimit',
  'enterpriseSsoLimit',
  'organizationsLimit',
  'samlApplicationsLimit',
  'customDomainsLimit',
]) satisfies ToZodEnum<SharedUsageKey>;

/** All usage keys that need to be checked (union of SystemUsageKey and QuotaUsageKey). */
export type UsageKey = QuotaUsageKey | SystemUsageKey;

const systemUsageKeyGuard = z.enum([
  ...sharedUsageKeyGuard.options,
  'usersPerOrganizationLimit',
  'organizationUserRolesLimit',
  'organizationMachineToMachineRolesLimit',
  'organizationScopesLimit',
]) satisfies ToZodEnum<SystemUsageKey>;

export const isSystemUsageKey = (key: UsageKey): key is SystemUsageKey =>
  systemUsageKeyGuard.safeParse(key).success;

const quotaUsageKeyGuard = z.enum([
  ...sharedUsageKeyGuard.options,
  'customJwtEnabled',
  'subjectTokenEnabled',
  'bringYourUiEnabled',
  'collectUserProfileEnabled',
  'mfaEnabled',
  'securityFeaturesEnabled',
  'idpInitiatedSsoEnabled',
  'customDomainsLimit',
]) satisfies ToZodEnum<QuotaUsageKey>;

export const isQuotaUsageKey = (key: UsageKey): key is QuotaUsageKey =>
  quotaUsageKeyGuard.safeParse(key).success;

/** Numeric quota keys (subset of QuotaUsageKey with numeric values). */
type NumericQuotaUsageKey = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in QuotaUsageKey]: SubscriptionQuota[K] extends number | null ? K : never;
}[QuotaUsageKey];

const numericQuotaUsageKeyGuard = z.enum([
  'applicationsLimit',
  'thirdPartyApplicationsLimit',
  'machineToMachineLimit',
  'userRolesLimit',
  'machineToMachineRolesLimit',
  'scopesPerRoleLimit',
  'scopesPerResourceLimit',
  'hooksLimit',
  'resourcesLimit',
  'enterpriseSsoLimit',
  'organizationsLimit',
  'samlApplicationsLimit',
  'socialConnectorsLimit',
  'customDomainsLimit',
]) satisfies ToZodEnum<NumericQuotaUsageKey>;

export const isNumericQuotaUsageKey = (key: string): key is NumericQuotaUsageKey =>
  numericQuotaUsageKeyGuard.safeParse(key).success;

/** Boolean quota keys (subset of QuotaUsageKey with boolean values, i.e., feature toggles). */
type BooleanQuotaUsageKey = {
  [K in QuotaUsageKey]: SubscriptionQuota[K] extends boolean ? K : never;
}[QuotaUsageKey];

const booleanQuotaUsageKeyGuard = z.enum([
  'customJwtEnabled',
  'subjectTokenEnabled',
  'bringYourUiEnabled',
  'collectUserProfileEnabled',
  'mfaEnabled',
  'idpInitiatedSsoEnabled',
  'securityFeaturesEnabled',
]) satisfies ToZodEnum<BooleanQuotaUsageKey>;

export const isBooleanQuotaUsageKey = (key: string): key is BooleanQuotaUsageKey =>
  booleanQuotaUsageKeyGuard.safeParse(key).success;

/** All numeric usage keys (union of NumericQuotaUsageKey and SystemUsageKey). */
export type NumericUsageKey = NumericQuotaUsageKey | SystemUsageKey;

/**
 * Self-computed usage keys - usage data queryable from the database.
 *
 * Excludes `socialConnectorsLimit` as it requires querying the Connector Library.
 */
export type SelfComputedUsageKey = Exclude<NumericUsageKey, 'socialConnectorsLimit'>;

/**
 * Entity-based usage keys - requires specific entity context (e.g., resourceId, roleId).
 *
 * These keys require an `entityId` parameter to query usage for a specific entity.
 */
export type EntityBasedUsageKey =
  | 'scopesPerResourceLimit'
  | 'scopesPerRoleLimit'
  | 'usersPerOrganizationLimit';

/**
 * Tenant-based usage keys - queryable at tenant level without entity context.
 *
 * These keys represent tenant-wide counts (e.g., total applications, hooks, organizations).
 */
export type TenantBasedUsageKey = Exclude<SelfComputedUsageKey, EntityBasedUsageKey>;
