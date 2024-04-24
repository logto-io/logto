import { object, string } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

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
      response: object({ protectedApps: object({ defaultDomain: string() }) }),
      status: [200, 501],
    }),
    async (ctx, next) => {
      const defaultDomain = await protectedApps.getDefaultDomain();

      ctx.body = { protectedApps: { defaultDomain } };

      return next();
    }
  );
}
