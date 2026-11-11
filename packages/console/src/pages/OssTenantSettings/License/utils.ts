import { type AdminConsoleKey, type LogtoErrorCode } from '@logto/phrases';
import { LicenseEnv } from '@logto/schemas';

import { isDevFeaturesEnabled } from '@/consts/env';
import { logtoCloudConsoleLink, selfHostedPlansLink } from '@/consts/external-links';
import { type License } from '@/types/license';

/**
 * The install failures the submitted key is responsible for.
 *
 * They are explained on the form next to the key that caused them instead of in a toast, and are
 * the only two the page handles: anything else is a server or transport problem and keeps the
 * global error handling.
 */
const licenseInstallErrorCodes: readonly string[] = Object.freeze([
  'license.invalid_key',
  'license.expired_key',
] satisfies LogtoErrorCode[]);

export const isLicenseInstallErrorCode = (code: string) => licenseInstallErrorCodes.includes(code);

/** The Cloud Console page where an account buys and manages its self-hosted licenses. */
const selfHostedLicensesUrl = new URL('/self-hosted-licenses', logtoCloudConsoleLink).toString();

const buildAttributedUrl = (baseUrl: string, content: string) => {
  const url = new URL(baseUrl);

  url.searchParams.set('utm_source', 'logto_oss');
  url.searchParams.set('utm_medium', 'console');
  url.searchParams.set('utm_campaign', 'self_hosted_plans');
  url.searchParams.set('utm_content', content);

  return url.toString();
};

/**
 * Where an operator without a license buys one: the Cloud "Self-hosted licenses" page with the
 * Self-hosted Pro purchase open, signing up first when the operator has no Cloud account.
 *
 * The URL is built here rather than with `buildSelfHostedPlansUrl`: that helper attributes the
 * upsell touchpoints that lead to this page, while this is the page they lead to, so it carries its
 * own `utm_content`.
 */
export const buildLicensePurchaseUrl = () => {
  // Self-hosted Pro self-serve purchase: keep the website plans page until Cloud sells licenses.
  if (!isDevFeaturesEnabled) {
    return buildAttributedUrl(selfHostedPlansLink, 'tenant_settings_license_page');
  }

  const url = new URL(selfHostedLicensesUrl);

  url.searchParams.set('checkout', 'self-hosted-pro');
  url.searchParams.set('signUp', 'true');

  return buildAttributedUrl(url.toString(), 'tenant_settings_license_page');
};

/**
 * Where an operator gets a fresh key after grace expires: the Cloud "Self-hosted licenses" page,
 * where the license owner manages the subscription and issues keys.
 */
export const buildLicenseManagementUrl = () =>
  buildAttributedUrl(
    // Self-hosted Pro self-serve purchase: keep the website contact flow until Cloud sells licenses.
    isDevFeaturesEnabled ? selfHostedLicensesUrl : selfHostedPlansLink,
    'tenant_settings_license_refresh'
  );

type LicenseStatus = 'active' | 'refresh_required' | 'grace_expired';

type LicenseStatusInput = Pick<License, 'expiresAt' | 'graceEndsAt' | 'refusalReason'>;

/**
 * Resolve the page state from the server timestamps. A refused refresh takes precedence over an
 * expired key while both are inside grace, because it explains why the refresh has not succeeded.
 */
export const getLicenseStatus = (license: LicenseStatusInput, now = Date.now()): LicenseStatus => {
  if (Date.parse(license.graceEndsAt) <= now) {
    return 'grace_expired';
  }

  if (Boolean(license.refusalReason) || Date.parse(license.expiresAt) <= now) {
    return 'refresh_required';
  }

  return 'active';
};

const licenseRefusalReasonPhraseKeys: Partial<Record<string, AdminConsoleKey>> = Object.freeze({
  canceled: 'tenants.license.refusal_reason_canceled',
  unpaid: 'tenants.license.refusal_reason_unpaid',
  expired: 'tenants.license.refusal_reason_expired',
  revoked: 'tenants.license.refusal_reason_revoked',
} as const);

export const getLicenseRefusalReasonPhraseKey = (reason?: string) => {
  return licenseRefusalReasonPhraseKeys[reason ?? ''] ?? 'tenants.license.refusal_reason_unknown';
};

/** The phrase describing the environment the installed key declares. */
export const licenseEnvPhraseKeys = Object.freeze({
  [LicenseEnv.Production]: 'tenants.license.environment_production',
  [LicenseEnv.NonProduction]: 'tenants.license.environment_non_production',
} as const);
