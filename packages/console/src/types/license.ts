import { type LicenseEnv, type LicenseQuota, type SelfHostedPlanId } from '@logto/schemas';

/**
 * The license installed on a self-hosted deployment, as `GET /api/systems/license` returns it.
 *
 * The key itself is never returned, so Console cannot copy it off the deployment.
 */
export type License = {
  /** The plan the license grants. */
  plan: SelfHostedPlanId;
  /** The environment the installed key was issued for, as the customer declared it. */
  env: LicenseEnv;
  /** The effective entitlements: the self-hosted defaults with the key's overrides applied. */
  quota: LicenseQuota;
  /** When the installed key expires, in ISO 8601 format. */
  expiresAt: string;
  /** When the key was installed on this deployment, in ISO 8601 format. */
  installedAt: string;
};
