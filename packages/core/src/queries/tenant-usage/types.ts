import { z } from 'zod';

import {
  type SystemLimit,
  type SubscriptionQuota,
  type SystemLimitKey,
  systemLimitGuard,
  logtoSkuQuotaGuard,
} from '#src/utils/subscription/types.js';
import { type RequiredNonNullProperties, type ToZodEnum } from '#src/utils/type.js';

type QuotaLimitMap = Omit<SubscriptionQuota, 'mauLimit' | 'tokenLimit'>;

export type QuotaLimitKey = keyof QuotaLimitMap;

/**
 * All limit keys - used for limit checking
 */
export type AllLimitKey = QuotaLimitKey | SystemLimitKey;

export const isSystemLimitKey = (key: AllLimitKey): key is SystemLimitKey =>
  systemLimitGuard.required().keyof().safeParse(key).success;

export const isQuotaLimitKey = (key: AllLimitKey): key is keyof QuotaLimitMap =>
  logtoSkuQuotaGuard
    .omit({
      mauLimit: true,
      tokenLimit: true,
    })
    .keyof()
    .safeParse(key).success;

/**
 * Complete limit map for type-safe limit classification
 *
 * @remarks
 * This is an internal type used to derive {@link BooleanFeatureKey} and {@link NumericLimitKey}.
 * Its keys are exactly {@link AllLimitKey} (QuotaLimitKey | SystemLimitKey).
 *
 * **Purpose:** Provides compile-time type safety when classifying limits.
 * When {@link SubscriptionQuota} or {@link SystemLimit} types change, TypeScript will
 * report errors in {@link BooleanFeatureKey} or {@link NumericLimitKey} if the
 * corresponding guard enums are not updated accordingly.
 *
 * **Why RequiredNonNullProperties:**
 * Ensures all {@link SystemLimit} keys are present (not optional) in the merged type,
 * so they can be properly classified as {@link BooleanFeatureKey} or {@link NumericLimitKey}.
 */
type AllLimitMap = QuotaLimitMap & RequiredNonNullProperties<SystemLimit>;

/**
 * Boolean feature keys - feature flags (enabled/disabled)
 *
 * @remarks
 * These represent boolean feature flags that control feature availability.
 *
 * @example
 * - mfaEnabled
 * - customJwtEnabled
 * - securityFeaturesEnabled
 */
type BooleanFeatureKey = {
  [K in keyof AllLimitMap]: AllLimitMap[K] extends boolean ? K : never;
}[keyof AllLimitMap];

const booleanFeatureKeyGuard = z.enum([
  'customJwtEnabled',
  'subjectTokenEnabled',
  'bringYourUiEnabled',
  'collectUserProfileEnabled',
  'mfaEnabled',
  'idpInitiatedSsoEnabled',
  'securityFeaturesEnabled',
]) satisfies ToZodEnum<BooleanFeatureKey>;

export const isBooleanFeatureKey = (key: string): key is BooleanFeatureKey =>
  booleanFeatureKeyGuard.safeParse(key).success;

/**
 * Numeric limit keys - numeric usage limits
 *
 * @remarks
 * These represent countable limits that can be queried for current usage.
 *
 * @example
 * - applicationsLimit
 * - hooksLimit
 * - organizationsLimit
 */
export type NumericLimitKey = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof AllLimitMap]: AllLimitMap[K] extends number | null ? K : never;
}[keyof AllLimitMap];

const numericLimitKeyGuard = z.enum([
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
  'tenantMembersLimit',
  'usersPerOrganizationLimit',
  'organizationUserRolesLimit',
  'organizationMachineToMachineRolesLimit',
  'organizationScopesLimit',
]) satisfies ToZodEnum<NumericLimitKey>;

export const isNumericLimitKey = (key: AllLimitKey): key is NumericLimitKey =>
  numericLimitKeyGuard.safeParse(key).success;
/**
 * Self-computed usage keys - usage data queried from local tenant database
 *
 * @remarks
 * These usage values are calculated from the tenant's own database.
 *
 * **Why only numeric limits:**
 * During quota checks, boolean features (feature availability) are checked directly
 * against the plan quota - `true` means allowed, `false` means not allowed.
 * Only consumable/numeric limits require actual usage calculation by querying
 * the database to compare current usage against the limit.
 *
 * **Excluded keys:**
 * Not all numeric limits are self-computed. The following require external data sources:
 * - `tenantMembersLimit`: queried from Cloud API
 * - `socialConnectorsLimit`: queried from Connector Library
 */
export type SelfComputedUsageKey = Exclude<
  NumericLimitKey,
  'tenantMembersLimit' | 'socialConnectorsLimit'
>;

/**
 * Entity-based usage keys - requires specific entity context
 *
 * @remarks
 * These keys require a { entityId: string } context parameter.
 * The semantic meaning of entityId depends on the key:
 * - scopesPerResourceLimit: entityId = resourceId
 * - scopesPerRoleLimit: entityId = roleId
 */
export type EntityBasedUsageKey =
  | 'scopesPerResourceLimit'
  | 'scopesPerRoleLimit'
  | 'usersPerOrganizationLimit';

/**
 * Tenant-based usage keys - queryable at tenant level without entity context
 *
 * @remarks
 * These keys represent tenant-wide counts.
 *
 * @example
 * - applicationsLimit (total applications in tenant)
 * - hooksLimit (total hooks in tenant)
 * - organizationsLimit (total organizations in tenant)
 */
export type TenantBasedUsageKey = Exclude<SelfComputedUsageKey, EntityBasedUsageKey>;
