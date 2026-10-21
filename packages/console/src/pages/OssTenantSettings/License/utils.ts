import { type AdminConsoleKey, type LogtoErrorCode } from '@logto/phrases';
import {
  LicenseEnv,
  type LicenseUsageMetric,
  type LicenseUsageStatementMonth,
  type LicenseUsageWarning,
} from '@logto/schemas';

import { selfHostedPlansLink } from '@/consts/external-links';
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

/**
 * Where an operator without a license buys one.
 *
 * The URL is built here rather than with `buildSelfHostedPlansUrl`: that helper attributes the
 * upsell touchpoints that lead to this page, while this is the page they lead to, so it carries its
 * own `utm_content`. Until the Cloud "Self-hosted licenses" page ships, it points at the plans page
 * on the website.
 */
export const buildLicensePurchaseUrl = () => {
  const url = new URL(selfHostedPlansLink);

  url.searchParams.set('utm_source', 'logto_oss');
  url.searchParams.set('utm_medium', 'console');
  url.searchParams.set('utm_campaign', 'self_hosted_plans');
  url.searchParams.set('utm_content', 'tenant_settings_license_page');

  return url.toString();
};

/**
 * Where an operator requests a fresh key after grace expires. Keep the existing contact flow
 * until the Cloud self-service license management page ships.
 */
export const buildLicenseManagementUrl = () => {
  const url = new URL(selfHostedPlansLink);

  url.searchParams.set('utm_source', 'logto_oss');
  url.searchParams.set('utm_medium', 'console');
  url.searchParams.set('utm_campaign', 'self_hosted_plans');
  url.searchParams.set('utm_content', 'tenant_settings_license_refresh');

  return url.toString();
};

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

/** The warning of a metric, if the metrics of this deployment exceed its limit. */
export const getUsageWarning = (
  warnings: LicenseUsageWarning[] | undefined,
  metric: LicenseUsageMetric
) => warnings?.find((warning) => warning.metric === metric);

/**
 * Format a `YYYY-MM` usage month in the Console language, e.g. "October 2026".
 *
 * The month is counted in UTC by Core, so it is formatted in UTC too instead of shifting it into
 * the browser's time zone.
 */
export const formatUsageMonth = (month: string, locale: string) => {
  const [year = 0, monthNumber = 1] = month.split('-').map(Number);

  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
};

/** The `YYYY-MM` month before `month`, which is the last full month of a usage snapshot. */
export const getPreviousUsageMonth = (month: string) => {
  const [year = 0, monthNumber = 1] = month.split('-').map(Number);
  const previous = new Date(Date.UTC(year, monthNumber - 2, 1));

  return `${previous.getUTCFullYear()}-${String(previous.getUTCMonth() + 1).padStart(2, '0')}`;
};

const escapeCsvValue = (value: string) =>
  /[\n",]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;

/**
 * Build the CSV of a usage statement: one row per full calendar month, oldest first.
 *
 * The headers are passed in so they follow the Console language, while the month and the counts
 * stay machine-readable.
 */
export const buildUsageStatementCsv = (
  months: readonly LicenseUsageStatementMonth[],
  headers: { month: string; mau: string; monthlyAccessTokens: string }
) =>
  [
    [headers.month, headers.mau, headers.monthlyAccessTokens],
    ...months.map(({ month, mau, monthlyAccessTokens }) => [
      month,
      String(mau),
      String(monthlyAccessTokens),
    ]),
  ]
    .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
    .join('\n');
