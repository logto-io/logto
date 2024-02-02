import { object, string } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import koaGuard from '#src/middleware/koa-guard.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

export default function systemRoutes<T extends AuthedRouter>(
  ...[
    router,
    {
      libraries: { protectedApps },
    },
  ]: RouterInitArgs<T>
) {
  // FIXME: @wangsijie
  if (EnvSet.values.isDevFeaturesEnabled) {
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
}
