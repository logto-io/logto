import { userInfoSelectFields } from '@logto/schemas';
import pick from 'lodash.pick';
import { object, string } from 'zod';

import { encryptUserPassword } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import { deleteUserById, findAllUsers, findUserById, updateUserById } from '@/queries/user';

import { AnonymousRouter } from './types';

export default function userRoutes<T extends AnonymousRouter>(router: T) {
  router.get('/users', async (ctx, next) => {
    const users = await findAllUsers();
    ctx.body = users.map((user) => pick(user, ...userInfoSelectFields));
    return next();
  });

  router.get(
    '/users/:userId',
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
    '/users/:userId/password',
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

      await updateUserById(userId, {
        passwordEncryptionSalt,
        passwordEncrypted,
      });
      const user = await findUserById(userId);
      ctx.body = pick(user, ...userInfoSelectFields);
      return next();
    }
  );

  router.delete(
    '/users/:userId',
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
