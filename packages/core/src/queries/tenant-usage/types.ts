import { z } from 'zod';

import { type SubscriptionQuota } from '#src/utils/subscription/types.js';
import { type ToZodEnum } from '#src/utils/type.js';

type AllLimitMap = Omit<SubscriptionQuota, 'mauLimit' | 'tokenLimit'>;
/**
 * All limit keys - currently from SubscriptionQuota
 *
 * @remarks
 * Future extension point: Can be extended to union with SystemLimit keys
 * Example: `export type AllLimitKey = keyof SubscriptionQuota | keyof SystemLimit;`
 */
export type AllLimitKey = keyof AllLimitMap;

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
export type EntityBasedUsageKey = 'scopesPerResourceLimit' | 'scopesPerRoleLimit';

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
