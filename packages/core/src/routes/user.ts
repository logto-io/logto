import { userInfoSelectFields } from '@logto/schemas';
import pick from 'lodash.pick';
import { ForeignKeyIntegrityConstraintViolationError } from 'slonik';
import { object, string } from 'zod';

import { encryptUserPassword } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import { finRolesByRoleName } from '@/queries/roles';
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

      const user = await updateUserById(userId, {
        passwordEncryptionSalt,
        passwordEncrypted,
      });
      ctx.body = pick(user, ...userInfoSelectFields);

      return next();
    }
  );

  router.patch(
    '/users/:userId/roles',
    koaGuard({
      params: object({ userId: string().min(1) }),
      body: object({ roles: string().array().nullable() }),
    }),
    async (ctx, next) => {
      const {
        params: { userId },
        body: { roles: roleNames },
      } = ctx.guard;

      await findUserById(userId);

      // Temp solution to validate the existence of input roleNames
      if (roleNames?.length) {
        const roles = await finRolesByRoleName(roleNames);
        if (roles.length !== roleNames.length) {
          throw new ForeignKeyIntegrityConstraintViolationError(
            new Error('foreign_key_violation'),
            'Invalid role names'
          );
        }
      }

      const user = await updateUserById(userId, { roleNames });
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
