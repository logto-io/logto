import {
  type LicenseEnv,
  type LicenseQuota,
  type LicenseUsage,
  type LicenseUsageLimits,
  type LicenseUsageStatement,
  type LicenseUsageWarning,
  type SelfHostedPlanId,
} from '@logto/schemas';

import { authedAdminApi } from './api.js';

/**
 * The installed license as `GET /api/systems/license` returns it. The key itself is never returned.
 *
 * Not `InstalledLicense`, which `@logto/schemas` already uses for the stored row (`{ jwt,
 * installedAt }`).
 */
export type SystemLicenseResponse = {
  plan: SelfHostedPlanId;
  env: LicenseEnv;
  quota: LicenseQuota;
  expiresAt: string;
  installedAt: string;
  lastRefreshedAt: string;
  graceEndsAt: string;
  refusalReason?: string;
  usageLimits?: LicenseUsageLimits;
  usage?: LicenseUsage;
  usageWarnings?: LicenseUsageWarning[];
  usageReportingEnabled?: boolean;
};

export const getSystemLicense = async () =>
  authedAdminApi.get('systems/license').json<SystemLicenseResponse>();

export const putSystemLicense = async (license: string) =>
  authedAdminApi.put('systems/license', { json: { license } });

export const getSystemLicenseUsageStatement = async () =>
  authedAdminApi.get('systems/license/usage-statement').json<LicenseUsageStatement>();
