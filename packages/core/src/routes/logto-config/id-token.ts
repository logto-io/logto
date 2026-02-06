import { idTokenConfigGuard } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { koaQuotaGuard } from '#src/middleware/koa-quota-guard.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

export default function idTokenRoutes<T extends ManagementApiRouter>(
  ...[router, { logtoConfigs, libraries }]: RouterInitArgs<T>
) {
  router.get(
    '/configs/id-token',
    koaGuard({
      response: idTokenConfigGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const config = await logtoConfigs.getIdTokenConfig();

      if (!config) {
        throw new RequestError({ code: 'entity.not_found', status: 404 });
      }

      ctx.body = config;
      return next();
    }
  );

  router.put(
    '/configs/id-token',
    koaGuard({
      body: idTokenConfigGuard,
      response: idTokenConfigGuard,
      status: [200, 403],
    }),
    koaQuotaGuard({ key: 'customJwtEnabled', quota: libraries.quota }),
    async (ctx, next) => {
      ctx.body = await logtoConfigs.upsertIdTokenConfig(ctx.guard.body);
      return next();
    }
  );
}
