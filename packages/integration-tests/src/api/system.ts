import { type LicenseEnv, type LicenseQuota, type SelfHostedPlanId } from '@logto/schemas';

import { authedAdminApi } from './api.js';

/** The installed license as `GET /api/systems/license` returns it. The key itself is never returned. */
export type InstalledLicense = {
  plan: SelfHostedPlanId;
  env: LicenseEnv;
  quota: LicenseQuota;
  expiresAt: string;
  installedAt: string;
};

export const getSystemLicense = async () =>
  authedAdminApi.get('systems/license').json<InstalledLicense>();

export const putSystemLicense = async (license: string) =>
  authedAdminApi.put('systems/license', { json: { license } });
