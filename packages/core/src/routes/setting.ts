import { Settings } from '@logto/schemas';

import RequestError from '@/errors/RequestError';
import koaGuard from '@/middleware/koa-guard';
import { getSetting, updateSettingById } from '@/queries/setting';

import { AnonymousRouter } from './types';

export default function settingRoutes<T extends AnonymousRouter>(router: T) {
  router.get('/settings', async (ctx, next) => {
    try {
      ctx.body = await getSetting();
    } catch {
      throw new RequestError('entity.not_exists');
    }

    return next();
  });

  router.patch(
    '/settings',
    koaGuard({
      body: Settings.guard,
    }),
    async (ctx, next) => {
      const { body: setting } = ctx.guard;
      ctx.body = await updateSettingById(setting.id, setting);

      return next();
    }
  );
}
