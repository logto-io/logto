import { Settings } from '@logto/schemas';

import koaGuard from '@/middleware/koa-guard';
import { getSetting, updateSetting } from '@/queries/setting';

import { AuthedRouter } from './types';

export default function settingRoutes<T extends AuthedRouter>(router: T) {
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
