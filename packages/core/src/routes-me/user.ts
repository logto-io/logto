import { passwordRegEx } from '@logto/core-kit';
import { arbitraryObjectGuard } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { encryptUserPassword, verifyUserPassword } from '#src/libraries/user.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import type { RouterInitArgs } from '../routes/types.js';
import type { AuthedMeRouter } from './types.js';

export default function userRoutes<T extends AuthedMeRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const { findUserById, updateUserById } = tenant.queries.users;

  router.patch(
    '/user',
    koaGuard({
      body: object({
        avatar: string().optional(),
        name: string().optional(),
        username: string().optional(),
      }),
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { avatar, name, username } = ctx.guard.body;

      const user = await findUserById(userId);
      assertThat(!user.isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

      await updateUserById(userId, {
        ...conditional(avatar !== undefined && { avatar }),
        ...conditional(name !== undefined && { name }),
        ...conditional(username !== undefined && { username }),
      });

      ctx.status = 204;

      return next();
    }
  );

  router.get('/custom-data', async (ctx, next) => {
    const { id: userId } = ctx.auth;
    const user = await findUserById(userId);

    ctx.body = user.customData;

    return next();
  });

  router.patch(
    '/custom-data',
    koaGuard({
      body: arbitraryObjectGuard,
      response: arbitraryObjectGuard,
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { body: customData } = ctx.guard;

      await findUserById(userId);

      const user = await updateUserById(userId, {
        customData,
      });

      ctx.body = user.customData;

      return next();
    }
  );

  router.post(
    '/password/verify',
    koaGuard({
      body: object({ password: string().regex(passwordRegEx) }),
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { password } = ctx.guard.body;

      const user = await findUserById(userId);
      await verifyUserPassword(user, password);

      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/password',
    koaGuard({ body: object({ password: string().regex(passwordRegEx) }) }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { password } = ctx.guard.body;

      const user = await findUserById(userId);
      assertThat(!user.isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

      const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(password);
      await updateUserById(userId, { passwordEncrypted, passwordEncryptionMethod });

      ctx.status = 204;

      return next();
    }
  );
}
