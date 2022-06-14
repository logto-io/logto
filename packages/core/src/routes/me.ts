import { arbitraryObjectGuard } from '@logto/schemas';
import { object } from 'zod';

import koaGuard from '@/middleware/koa-guard';
import { findUserById, updateUserById } from '@/queries/user';

import { AuthedRouter } from './types';

export default function meRoutes<T extends AuthedRouter>(router: T) {
  router.get('/me/custom-data', async (ctx, next) => {
    const { customData } = await findUserById(ctx.auth);

    ctx.body = customData;

    return next();
  });

  router.patch(
    '/me/custom-data',
    koaGuard({ body: object({ customData: arbitraryObjectGuard }) }),
    async (ctx, next) => {
      const {
        body: { customData },
      } = ctx.guard;

      await findUserById(ctx.auth);

      const user = await updateUserById(ctx.auth, {
        customData,
      });

      ctx.body = user.customData;

      return next();
    }
  );
}
