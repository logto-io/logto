import { LicenseEnv, LicenseKey, licenseQuotaGuard, selfHostedPlanIds } from '@logto/schemas';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import LicenseReader from '#src/license/LicenseReader.js';
import { LicenseVerificationError, verifyLicenseKey } from '#src/license/verify.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { createSystemsQuery } from '#src/queries/system.js';
import assertThat from '#src/utils/assert-that.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

/**
 * The license as the Management API exposes it. The installed key itself is never returned, so a
 * caller cannot copy it to another deployment.
 */
const licenseResponseGuard = z.object({
  /** The plan the key grants. */
  plan: z.enum(selfHostedPlanIds),
  /** The deployment the key was issued for, as declared by whoever installed it. */
  env: z.nativeEnum(LicenseEnv),
  /** The effective entitlements: the self-hosted defaults with the key's overrides applied. */
  quota: licenseQuotaGuard,
  /** When the key expires, as an ISO 8601 timestamp. */
  expiresAt: z.string(),
  /** When the installed key was installed, as an ISO 8601 timestamp. */
  installedAt: z.string(),
});

/**
 * A license belongs to a self-hosted deployment: on Cloud the subscription is the entitlement
 * source, and there is nothing for a tenant to install.
 */
const assertNotCloud = () => {
  assertThat(
    !EnvSet.values.isCloud,
    new RequestError({ code: 'request.feature_not_supported', status: 501 })
  );
};

/**
 * Verify a license key against the public key this build trusts and read its claims.
 *
 * @throws {RequestError} `license.invalid_key` when the key is not signed by a trusted key or its
 * claims are not a license payload.
 */
const readLicensePayload = async (license: string) => {
  try {
    return await verifyLicenseKey(license);
  } catch (error: unknown) {
    if (error instanceof LicenseVerificationError) {
      throw new RequestError({ code: 'license.invalid_key' });
    }

    throw error;
  }
};

export default function systemRoutes<T extends ManagementApiRouter>(
  ...[
    router,
    {
      libraries: { protectedApps },
    },
  ]: RouterInitArgs<T>
) {
  router.get(
    '/systems/application',
    koaGuard({
      response: z.object({ protectedApps: z.object({ defaultDomain: z.string() }) }),
      status: [200, 501],
    }),
    async (ctx, next) => {
      const defaultDomain = await protectedApps.getDefaultDomain();

      ctx.body = { protectedApps: { defaultDomain } };

      return next();
    }
  );

  /**
   * Self-hosted plans: the license is the entitlement source of the unlaunched self-hosted Pro and
   * Enterprise plans. Removed together with the other self-hosted plans guards at launch.
   */
  if (EnvSet.values.isDevFeaturesEnabled) {
    router.get(
      '/systems/license',
      koaGuard({
        response: licenseResponseGuard,
        status: [200, 404, 501],
      }),
      async (ctx, next) => {
        assertNotCloud();

        const license = await LicenseReader.shared.read(await EnvSet.sharedPool);

        assertThat(license, new RequestError({ code: 'license.not_installed', status: 404 }));

        ctx.body = {
          plan: license.payload.plan,
          env: license.payload.env,
          quota: license.quota,
          expiresAt: new Date(license.payload.exp * 1000).toISOString(),
          installedAt: license.installedAt,
        };

        return next();
      }
    );

    router.put(
      '/systems/license',
      koaGuard({
        body: z.object({ license: z.string().min(1) }),
        status: [204, 400, 501],
      }),
      async (ctx, next) => {
        assertNotCloud();

        const { license } = ctx.guard.body;
        const { exp } = await readLicensePayload(license);

        // A key past `exp` is a stale copy. An installed key keeps its entitlements past its own
        // expiration, so installing is the one place the claim is checked.
        assertThat(exp * 1000 > Date.now(), new RequestError({ code: 'license.expired_key' }));

        /**
         * The `systems` table is global and revoked from the row-level-security restricted tenant
         * role, so the license is read and written through the shared pool, like
         * `SystemContext`'s provider configs.
         */
        const { upsertSystem } = createSystemsQuery(await EnvSet.sharedPool);

        await upsertSystem(LicenseKey.License, {
          jwt: license,
          installedAt: new Date().toISOString(),
        });
        LicenseReader.shared.invalidate();

        ctx.status = 204;

        return next();
      }
    );
  }
}
