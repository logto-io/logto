import { adminConsoleDataGuard } from '@logto/schemas';

import koaGuard from '#src/middleware/koa-guard.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

export default function logtoConfigRoutes<T extends AuthedRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const { getAdminConsoleConfig, updateAdminConsoleConfig } = queries.logtoConfigs;

  router.get(
    '/configs/admin-console',
    koaGuard({ response: adminConsoleDataGuard, status: 200 }),
    async (ctx, next) => {
      ctx.body = await getAdminConsoleConfig();

      return next();
    }
  );

  router.patch(
    '/configs/admin-console',
    koaGuard({
      body: adminConsoleDataGuard.partial(),
      response: adminConsoleDataGuard,
      status: 200,
    }),
    async (ctx, next) => {
      ctx.body = await updateAdminConsoleConfig(ctx.guard.body);

      return next();
    }
  );
}
