import { z } from 'zod';

import { type ToZodObject } from '../utils/zod.js';

import { ReservedPlanId } from './subscriptions.js';

/**
 * The deployment a license key is valid for.
 *
 * Logto signs one key per environment for the same license, identical except for this claim, so a
 * customer can run their staging or CI deployment without sharing the production key. Which key is
 * installed where is the customer's declaration; Logto does not verify it.
 */
export enum LicenseEnv {
  Production = 'production',
  NonProduction = 'non-production',
}

/** The plans a license key can grant. A Cloud-only plan is never a valid license `plan`. */
export const selfHostedPlanIds = Object.freeze([
  ReservedPlanId.SelfHostedPro,
  ReservedPlanId.SelfHostedEnterprise,
] as const);

/** The plan a license key grants. See {@link selfHostedPlanIds}. */
export type SelfHostedPlanId = (typeof selfHostedPlanIds)[number];

/**
 * The entitlements of a self-hosted instance: the features a license unlocks, plus the numeric
 * quotas it raises.
 *
 * The names follow the license payload rather than the Cloud `SubscriptionQuota` vocabulary
 * (`bringYourUi`, not `bringYourUiEnabled`): these values are resolved locally from an installed
 * key and never travel through the Cloud subscription API or its usage reporting.
 * `samlApplicationsLimit` is the one name shared with Cloud, and it keeps the same meaning there —
 * `null` is unlimited, a number is the hard cap.
 */
export type LicenseQuota = {
  /** Whether the sign-in experience may hide the Logto branding. */
  hideLogtoBranding: boolean;
  /** Whether custom sign-in experience assets and a custom CSP may be configured. */
  bringYourUi: boolean;
  /** Whether IdP-initiated SSO may be configured on an enterprise SSO connector. */
  idpInitiatedSso: boolean;
  /** Whether the instance's Console may be administered by more than one member. */
  consoleCollaboration: boolean;
  /** Whether the sign-in experience MFA policy may be set to mandatory. */
  mandatoryMfa: boolean;
  /**
   * Whether Logto's hosted email service may be used.
   *
   * Always `false` for {@link ReservedPlanId.SelfHostedPro}. The Enterprise offering is deferred,
   * so the flag is carried from the first signed key onwards and simply never set, which keeps the
   * signed shape stable when Enterprise ships.
   */
  hostedEmail: boolean;
  /** How many SAML applications the instance may create. `null` means unlimited. */
  samlApplicationsLimit: number | null;
};

export const licenseQuotaGuard = z.object({
  hideLogtoBranding: z.boolean(),
  bringYourUi: z.boolean(),
  idpInitiatedSso: z.boolean(),
  consoleCollaboration: z.boolean(),
  mandatoryMfa: z.boolean(),
  hostedEmail: z.boolean(),
  samlApplicationsLimit: z.number().int().nonnegative().nullable(),
}) satisfies ToZodObject<LicenseQuota>;

/**
 * The entitlements a license key grants, as they appear in its payload.
 *
 * Every field is optional: a key only carries what it changes, and an absent field falls back to
 * {@link ossDefaultQuota}. Keeping it partial means a key signed before a new entitlement existed
 * still verifies on a newer Logto, and the missing entitlement stays locked rather than breaking
 * the whole license. Use {@link resolveLicenseQuota} to apply the overrides.
 */
export const licenseQuotaOverridesGuard = licenseQuotaGuard.partial();

export type LicenseQuotaOverrides = z.infer<typeof licenseQuotaOverridesGuard>;

/**
 * The usage a license is expected to stay within, signed into the key next to {@link quota}.
 *
 * Unlike the quota, nothing enforces these limits: exceeding one only raises a usage warning in
 * Console and with Logto sales. They differ per {@link LicenseEnv}, so the production and
 * non-production keys of one license usually carry different limits.
 *
 * Every limit is optional, and an absent or `null` limit means the metric is only reported. Keys
 * signed before usage limits existed carry none at all.
 */
export type LicenseUsageLimits = {
  /** Monthly active users across all tenants except the admin tenant. */
  mau?: number | null;
  /** Production deployments of the license that recently refreshed. Counted by Logto Cloud. */
  productionDeployments?: number | null;
  /** Access tokens issued per month across all tenants except the admin tenant. */
  monthlyAccessTokens?: number | null;
};

export const licenseUsageLimitsGuard = z.object({
  mau: z.number().int().nonnegative().nullable().optional(),
  productionDeployments: z.number().int().nonnegative().nullable().optional(),
  monthlyAccessTokens: z.number().int().nonnegative().nullable().optional(),
}) satisfies ToZodObject<LicenseUsageLimits>;

/** The metrics a usage limit or warning may refer to. */
export enum LicenseUsageMetric {
  Mau = 'mau',
  ProductionDeployments = 'productionDeployments',
  MonthlyAccessTokens = 'monthlyAccessTokens',
}

/**
 * A monthly usage count of a self-hosted deployment, in UTC calendar months.
 *
 * Both months are kept because a limit is exceeded when either one is above it: the last full
 * month is the settled figure, and the month-to-date count only grows, so it can warn early without
 * ever being a false positive.
 */
export type LicenseMonthlyUsage = {
  /** The count of the last full calendar month. */
  lastMonth: number;
  /** The count of the current calendar month so far. */
  monthToDate: number;
};

export const licenseMonthlyUsageGuard = z.object({
  lastMonth: z.number().int().nonnegative(),
  monthToDate: z.number().int().nonnegative(),
}) satisfies ToZodObject<LicenseMonthlyUsage>;

/**
 * The usage of a self-hosted deployment, collected locally from its database. It carries counts
 * only and never any personal data.
 */
export type LicenseUsage = {
  /** The current calendar month as `YYYY-MM` in UTC, which `monthToDate` counts belong to. */
  month: string;
  /** Monthly active users across all tenants except the admin tenant. */
  mau: LicenseMonthlyUsage;
  /** Access tokens issued across all tenants except the admin tenant. */
  monthlyAccessTokens: LicenseMonthlyUsage;
  /** The number of tenants, excluding the admin tenant. */
  tenants: number;
};

export const licenseUsageGuard = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  mau: licenseMonthlyUsageGuard,
  monthlyAccessTokens: licenseMonthlyUsageGuard,
  tenants: z.number().int().nonnegative(),
}) satisfies ToZodObject<LicenseUsage>;

/** A usage metric of a self-hosted deployment that is above its {@link LicenseUsageLimits}. */
export type LicenseUsageWarning = {
  /**
   * The metric that exceeds its limit, usually a {@link LicenseUsageMetric}. It is a plain string
   * so a warning about a metric added later by Logto Cloud still parses on an older Logto.
   */
  metric: string;
  /** The limit the metric exceeds. */
  limit: number;
  /** The usage that exceeds the limit. */
  value: number;
};

export const licenseUsageWarningGuard = z.object({
  metric: z.string().min(1),
  limit: z.number().nonnegative(),
  value: z.number().nonnegative(),
}) satisfies ToZodObject<LicenseUsageWarning>;

/** The usage of a self-hosted deployment in one full calendar month, for a usage statement. */
export type LicenseUsageStatementMonth = {
  /** The calendar month as `YYYY-MM` in UTC. */
  month: string;
  /** Monthly active users across all tenants except the admin tenant. */
  mau: number;
  /** Access tokens issued across all tenants except the admin tenant. */
  monthlyAccessTokens: number;
};

export const licenseUsageStatementMonthGuard = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  mau: z.number().int().nonnegative(),
  monthlyAccessTokens: z.number().int().nonnegative(),
}) satisfies ToZodObject<LicenseUsageStatementMonth>;

/**
 * The monthly usage of a self-hosted deployment over its last full calendar months, from its own
 * records, which a customer can provide as the usage statement the self-hosted terms ask for.
 */
export type LicenseUsageStatement = {
  /** The last full calendar months, oldest first. A month without usage counts zero. */
  months: LicenseUsageStatementMonth[];
};

export const licenseUsageStatementGuard = z.object({
  months: licenseUsageStatementMonthGuard.array(),
}) satisfies ToZodObject<LicenseUsageStatement>;

/**
 * The payload of a license key, i.e. the claims of the ES256-signed JWT an operator installs on a
 * self-hosted instance.
 *
 * The signature is what makes the payload trustworthy, so none of it is editable after issuing.
 * Unknown claims are stripped rather than rejected, so a newer license service can add one without
 * invalidating the key on an older Logto.
 */
export type LicensePayload = {
  /** The plan the license grants. */
  plan: SelfHostedPlanId;
  /** The deployment the key is valid for. */
  env: LicenseEnv;
  /** The Logto customer the license was issued to, for support and renewal lookups. */
  customerId: string;
  /** The license's own identifier, shared by its production and non-production keys. */
  licenseId: string;
  /** When the key was signed, in seconds since the Unix epoch. */
  iat: number;
  /** When the key expires, in seconds since the Unix epoch. */
  exp: number;
  /** The entitlements the license grants on top of {@link ossDefaultQuota}. */
  quota: LicenseQuotaOverrides;
  /** The advisory usage limits of the license. Absent on keys signed before they existed. */
  usageLimits?: LicenseUsageLimits;
};

export const licensePayloadGuard = z.object({
  plan: z.enum(selfHostedPlanIds),
  env: z.nativeEnum(LicenseEnv),
  customerId: z.string(),
  licenseId: z.string(),
  iat: z.number().int().nonnegative(),
  exp: z.number().int().nonnegative(),
  quota: licenseQuotaOverridesGuard,
  // Unlike the enforced `quota`, a limit that does not parse is dropped rather than rejecting the
  // whole key: an advisory field must never take a customer's entitlements away.
  usageLimits: z.preprocess(
    (claim) => (licenseUsageLimitsGuard.safeParse(claim).success ? claim : undefined),
    licenseUsageLimitsGuard.optional()
  ),
}) satisfies ToZodObject<
  // The input of `usageLimits` is the claim as it arrives, which is what lets it drop what does not
  // parse; every other claim stays an exact mapping.
  Omit<LicensePayload, 'usageLimits'> & { usageLimits: unknown }
>;

/**
 * The entitlements of a self-hosted instance with no license key installed, i.e. today's OSS.
 *
 * Every feature is locked and SAML applications keep the long-standing cap of 3. Core falls back to
 * this when no valid license is installed, and Console displays it, so there is exactly one
 * definition of "self-hosted, no license".
 */
export const ossDefaultQuota = Object.freeze({
  hideLogtoBranding: false,
  bringYourUi: false,
  idpInitiatedSso: false,
  consoleCollaboration: false,
  mandatoryMfa: false,
  hostedEmail: false,
  samlApplicationsLimit: 3,
} satisfies LicenseQuota);

/**
 * Resolve the effective entitlements of a self-hosted instance by applying a license key's
 * overrides on top of {@link ossDefaultQuota}. Without a key, the OSS defaults are the answer.
 *
 * Core and Console both call this so they can never disagree on what a license grants. The fields
 * are applied one by one on purpose: `samlApplicationsLimit` is nullable and `null` means
 * unlimited, so a `??` merge would silently turn an unlimited license back into the OSS cap.
 */
export const resolveLicenseQuota = (overrides: LicenseQuotaOverrides = {}): LicenseQuota => ({
  hideLogtoBranding: overrides.hideLogtoBranding ?? ossDefaultQuota.hideLogtoBranding,
  bringYourUi: overrides.bringYourUi ?? ossDefaultQuota.bringYourUi,
  idpInitiatedSso: overrides.idpInitiatedSso ?? ossDefaultQuota.idpInitiatedSso,
  consoleCollaboration: overrides.consoleCollaboration ?? ossDefaultQuota.consoleCollaboration,
  mandatoryMfa: overrides.mandatoryMfa ?? ossDefaultQuota.mandatoryMfa,
  hostedEmail: overrides.hostedEmail ?? ossDefaultQuota.hostedEmail,
  samlApplicationsLimit:
    overrides.samlApplicationsLimit === undefined
      ? ossDefaultQuota.samlApplicationsLimit
      : overrides.samlApplicationsLimit,
});
