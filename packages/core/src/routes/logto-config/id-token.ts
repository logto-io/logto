import { idTokenConfigGuard } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

export default function idTokenRoutes<T extends ManagementApiRouter>(
  ...[router, { logtoConfigs }]: RouterInitArgs<T>
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

  router.patch(
    '/configs/id-token',
    koaGuard({
      body: idTokenConfigGuard,
      response: idTokenConfigGuard,
      status: [200],
    }),
    async (ctx, next) => {
      ctx.body = await logtoConfigs.updateIdTokenConfig(ctx.guard.body);
      return next();
    }
  );
}
