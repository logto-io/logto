import { type LogtoErrorCode } from '@logto/phrases';
import { LicenseEnv } from '@logto/schemas';

import { selfHostedPlansLink } from '@/consts/external-links';

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

/** The phrase describing the environment the installed key declares. */
export const licenseEnvPhraseKeys = Object.freeze({
  [LicenseEnv.Production]: 'tenants.license.environment_production',
  [LicenseEnv.NonProduction]: 'tenants.license.environment_non_production',
} as const);
