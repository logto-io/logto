import { arbitraryObjectGuard, userInfoSelectFields } from '@logto/schemas';
import { passwordRegEx } from '@logto/shared';
import pick from 'lodash.pick';
import { object, string } from 'zod';

import { encryptUserPassword } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import { findUserById, updateUserById } from '@/queries/user';

import { AuthedRouter } from './types';

export default function meRoutes<T extends AuthedRouter>(router: T) {
  router.get('/me', async (ctx, next) => {
    const user = await findUserById(ctx.auth);

    ctx.body = pick(user, ...userInfoSelectFields);

    return next();
  });

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

  router.patch(
    '/me/password',
    koaGuard({ body: object({ password: string().regex(passwordRegEx) }) }),
    async (ctx, next) => {
      const {
        body: { password },
      } = ctx.guard;

      const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(password);

      await updateUserById(ctx.auth, {
        passwordEncrypted,
        passwordEncryptionMethod,
      });

      ctx.status = 204;

      return next();
    }
  );
}
