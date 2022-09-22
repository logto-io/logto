import { passwordRegEx, usernameRegEx } from '@logto/core-kit';
import { arbitraryObjectGuard, userInfoSelectFields } from '@logto/schemas';
import { has } from '@silverhand/essentials';
import pick from 'lodash.pick';
import { literal, object, string } from 'zod';

import RequestError from '@/errors/RequestError';
import { encryptUserPassword, generateUserId, insertUser } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import koaPagination from '@/middleware/koa-pagination';
import { findRolesByRoleNames } from '@/queries/roles';
import {
  deleteUserById,
  deleteUserIdentity,
  findUsers,
  countUsers,
  findUserById,
  hasUser,
  updateUserById,
} from '@/queries/user';
import assertThat from '@/utils/assert-that';

import { AuthedRouter } from './types';

export default function adminUserRoutes<T extends AuthedRouter>(router: T) {
  router.get(
    '/users',
    koaPagination(),
    koaGuard({
      query: object({ search: string().optional(), hideAdminUser: literal('true').optional() }),
    }),
    async (ctx, next) => {
      const { limit, offset } = ctx.pagination;
      const {
        query: { search, hideAdminUser: _hideAdminUser },
      } = ctx.guard;

      const hideAdminUser = _hideAdminUser === 'true';
      const [{ count }, users] = await Promise.all([
        countUsers(search, hideAdminUser),
        findUsers(limit, offset, search, hideAdminUser),
      ]);

      ctx.pagination.totalCount = count;
      ctx.body = users.map((user) => pick(user, ...userInfoSelectFields));

      return next();
    }
  );

  router.get(
    '/users/:userId',
    koaGuard({
      params: object({ userId: string() }),
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

  router.get(
    '/users/:userId/custom-data',
    koaGuard({
      params: object({ userId: string() }),
      response: arbitraryObjectGuard,
    }),
    async (ctx, next) => {
      const {
        params: { userId },
      } = ctx.guard;

      const { customData } = await findUserById(userId);
      ctx.body = customData;

      return next();
    }
  );

  router.patch(
    '/users/:userId/custom-data',
    koaGuard({
      params: object({ userId: string() }),
      body: object({ customData: arbitraryObjectGuard }),
      response: arbitraryObjectGuard,
    }),
    async (ctx, next) => {
      const {
        params: { userId },
        body: { customData },
      } = ctx.guard;

      await findUserById(userId);

      const user = await updateUserById(userId, {
        customData,
      });

      ctx.body = user.customData;

      return next();
    }
  );

  router.post(
    '/users',
    koaGuard({
      body: object({
        username: string().regex(usernameRegEx),
        password: string().regex(passwordRegEx),
        name: string(),
      }),
    }),
    async (ctx, next) => {
      const { username, password, name } = ctx.guard.body;
      assertThat(
        !(await hasUser(username)),
        new RequestError({
          code: 'user.username_exists_register',
          status: 422,
        })
      );

      const id = await generateUserId();

      const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(password);

      const user = await insertUser({
        id,
        username,
        passwordEncrypted,
        passwordEncryptionMethod,
        name,
      });

      ctx.body = pick(user, ...userInfoSelectFields);

      return next();
    }
  );

  router.patch(
    '/users/:userId',
    koaGuard({
      params: object({ userId: string() }),
      body: object({
        name: string().nullable().optional(),
        avatar: string().url().or(literal('')).nullable().optional(),
        customData: arbitraryObjectGuard.optional(),
        roleNames: string().array().optional(),
      }),
    }),
    async (ctx, next) => {
      const {
        params: { userId },
        body,
      } = ctx.guard;

      await findUserById(userId);

      // Temp solution to validate the existence of input roleNames
      if (body.roleNames?.length) {
        const { roleNames } = body;
        const roles = await findRolesByRoleNames(roleNames);

        if (roles.length !== roleNames.length) {
          const resourcesNotFound = roleNames.filter(
            (roleName) => !roles.some(({ name }) => roleName === name)
          );
          throw new RequestError({
            status: 400,
            code: 'user.invalid_role_names',
            data: {
              roleNames: resourcesNotFound.join(','),
            },
          });
        }
      }

      const user = await updateUserById(
        userId,
        {
          ...body,
        },
        'replace'
      );

      ctx.body = pick(user, ...userInfoSelectFields);

      return next();
    }
  );

  router.patch(
    '/users/:userId/password',
    koaGuard({
      params: object({ userId: string() }),
      body: object({ password: string().regex(passwordRegEx) }),
    }),
    async (ctx, next) => {
      const {
        params: { userId },
        body: { password },
      } = ctx.guard;

      await findUserById(userId);

      const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(password);

      const user = await updateUserById(userId, {
        passwordEncrypted,
        passwordEncryptionMethod,
      });

      ctx.body = pick(user, ...userInfoSelectFields);

      return next();
    }
  );

  router.delete(
    '/users/:userId',
    koaGuard({
      params: object({ userId: string() }),
    }),
    async (ctx, next) => {
      const {
        params: { userId },
      } = ctx.guard;

      if (userId === ctx.auth.id) {
        throw new RequestError('user.cannot_delete_self');
      }

      await findUserById(userId);

      await deleteUserById(userId);

      ctx.status = 204;

      return next();
    }
  );

  router.delete(
    '/users/:userId/identities/:target',
    koaGuard({ params: object({ userId: string(), target: string() }) }),
    async (ctx, next) => {
      const {
        params: { userId, target },
      } = ctx.guard;

      const { identities } = await findUserById(userId);

      if (!has(identities, target)) {
        throw new RequestError({ code: 'user.identity_not_exists', status: 404 });
      }

      const updatedUser = await deleteUserIdentity(userId, target);
      ctx.body = pick(updatedUser, ...userInfoSelectFields);

      return next();
    }
  );
}
