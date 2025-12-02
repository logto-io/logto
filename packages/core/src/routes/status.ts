import koaGuard from '#src/middleware/koa-guard.js';

import { EnvSet } from '../env-set/index.js';

import type { AnonymousRouter, RouterInitArgs } from './types.js';

export default function statusRoutes<T extends AnonymousRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  router.get('/status', koaGuard({ status: 204 }), async (ctx, next) => {
    ctx.status = 204;

    if (
      EnvSet.values.statusApiKey &&
      ctx.headers['logto-status-api-key'] === EnvSet.values.statusApiKey
    ) {
      ctx.set('Logto-Tenant-ID', tenant.id);
    }

    return next();
  });
}
