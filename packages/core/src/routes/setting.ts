import { Settings } from '@logto/schemas';

import koaGuard from '#src/middleware/koa-guard.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

export default function settingRoutes<T extends AuthedRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const { getSetting, updateSetting } = queries.settings;

  router.get('/settings', async (ctx, next) => {
    const { id, ...rest } = await getSetting();
    ctx.body = rest;

    return next();
  });

  router.patch(
    '/settings',
    koaGuard({
      body: Settings.createGuard.omit({ id: true }).deepPartial(),
    }),
    async (ctx, next) => {
      const { body: partialSettings } = ctx.guard;
      const { id, ...rest } = await updateSetting(partialSettings);
      ctx.body = rest;

      return next();
    }
  );
}
