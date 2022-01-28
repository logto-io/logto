import { userInfoSelectFields } from '@logto/schemas';
import pick from 'lodash.pick';
import { object, string } from 'zod';

import { encryptUserPassword } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import { deleteUserById, findUserById, updateUserById } from '@/queries/user';

import { AnonymousRouter } from './types';

export default function userRoutes<T extends AnonymousRouter>(router: T) {
  router.get(
    '/user/:userId',
    koaGuard({
      params: object({ userId: string().min(1) }),
    }),
    async (ctx, next) => {
      const {
        params: { userId },
      } = ctx.guard;
      const user = await findUserById(userId);
      ctx.body = pick(user, ...userInfoSelectFields);

      return next();
    }
  );

  router.patch(
    '/user/:userId/password',
    koaGuard({
      params: object({ userId: string().min(1) }),
      body: object({ password: string().min(6) }),
    }),
    async (ctx, next) => {
      const {
        params: { userId },
        body: { password },
      } = ctx.guard;

      await findUserById(userId);

      const { passwordEncrypted, passwordEncryptionSalt } = encryptUserPassword(userId, password);

      const user = await updateUserById(userId, {
        passwordEncryptionSalt,
        passwordEncrypted,
      });
      ctx.body = pick(user, ...userInfoSelectFields);

      return next();
    }
  );

  router.delete(
    '/user/:userId',
    koaGuard({
      params: object({ userId: string().min(1) }),
    }),
    async (ctx, next) => {
      const {
        params: { userId },
      } = ctx.guard;
      await deleteUserById(userId);
      ctx.status = 204;

      return next();
    }
  );
}
