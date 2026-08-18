import { cimdConfigGuard, ProductEvent } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';
import { captureEvent } from '#src/utils/posthog.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

/**
 * Routes for the OAuth Client ID Metadata Document (CIMD) enablement switch, stored as the
 * optional `cimd` tenant config object.
 */
export default function logtoConfigCimdRoutes<T extends ManagementApiRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  if (!EnvSet.values.isDevFeaturesEnabled) {
    return;
  }

  const { id: tenantId } = tenant;
  const { getCimdConfig, upsertCimdConfig } = tenant.queries.logtoConfigs;

  router.get(
    '/configs/cimd',
    koaGuard({
      response: cimdConfigGuard,
      status: [200],
    }),
    async (ctx, next) => {
      ctx.body = await getCimdConfig();

      return next();
    }
  );

  router.patch(
    '/configs/cimd',
    koaGuard({
      body: cimdConfigGuard.partial(),
      response: cimdConfigGuard,
      status: [200, 422],
    }),
    async (ctx, next) => {
      const { body } = ctx.guard;

      /**
       * Fail fast so enabling never looks successful while the protection is off. This is not the
       * authoritative gate: the env can be flipped after the config is stored, so provider
       * construction applies the same condition (LOG-13920).
       */
      assertThat(
        !body.enabled || EnvSet.values.isOidcProviderSsrfProtectionEnabled,
        new RequestError(
          { code: 'request.invalid_input', status: 422 },
          {
            details:
              'CIMD requires the OIDC provider SSRF protection. Remove `OIDC_PROVIDER_SSRF_PROTECTION_DISABLED` to enable CIMD.',
          }
        )
      );

      const current = await getCimdConfig();
      const updated = { ...current, ...body };
      await upsertCimdConfig(updated);

      ctx.body = updated;

      // Only capture the event when the switch actually flips.
      if (current.enabled !== updated.enabled) {
        captureEvent(
          { tenantId, request: ctx.req },
          updated.enabled ? ProductEvent.DynamicAppEnabled : ProductEvent.DynamicAppDisabled
        );
      }

      // The switch is applied at provider construction; rebuild the tenant on the next request.
      void tenant.invalidateCache();

      return next();
    }
  );
}
