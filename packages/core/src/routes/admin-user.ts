import { arbitraryObjectGuard, userInfoSelectFields } from '@logto/schemas';
import { nameRegEx, passwordRegEx, usernameRegEx } from '@logto/shared';
import { has } from '@silverhand/essentials';
import pick from 'lodash.pick';
import { InvalidInputError } from 'slonik';
import { object, string } from 'zod';

import RequestError from '@/errors/RequestError';
import { encryptUserPassword, generateUserId } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import koaPagination from '@/middleware/koa-pagination';
import { findRolesByRoleNames } from '@/queries/roles';
import {
  clearUserCustomDataById,
  deleteUserById,
  deleteUserIdentity,
  findUsers,
  countUsers,
  findUserById,
  hasUser,
  insertUser,
  updateUserById,
} from '@/queries/user';
import assertThat from '@/utils/assert-that';

import { AuthedRouter } from './types';

export default function adminUserRoutes<T extends AuthedRouter>(router: T) {
  router.get(
    '/users',
    koaPagination(),
    koaGuard({ query: object({ search: string().optional() }) }),
    async (ctx, next) => {
      const { limit, offset } = ctx.pagination;
      const {
        query: { search },
      } = ctx.guard;

      const [{ count }, users] = await Promise.all([
        countUsers(search),
        findUsers(limit, offset, search),
      ]);

      ctx.pagination.totalCount = count;
      ctx.body = users.map((user) => pick(user, ...userInfoSelectFields));

      return next();
    }
  );

  router.get(
    '/users/:userId',
    // TODO: No need to guard
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

  router.post(
    '/users',
    koaGuard({
      body: object({
        username: string().regex(usernameRegEx),
        password: string().regex(passwordRegEx),
        name: string().regex(nameRegEx),
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
        name: string().regex(nameRegEx).optional(),
        avatar: string().url().nullable().optional(),
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

      // Clear customData to achieve full replacement,
      // to partial update, call patch /users/:userId/custom-data
      if (body.customData) {
        await clearUserCustomDataById(userId);
      }

      // Temp solution to validate the existence of input roleNames
      if (body.roleNames?.length) {
        const { roleNames } = body;
        const roles = await findRolesByRoleNames(roleNames);

        if (roles.length !== roleNames.length) {
          const resourcesNotFound = roleNames.filter(
            (roleName) => !roles.some(({ name }) => roleName === name)
          );
          // TODO: Should be cached by the error handler and return request error
          throw new InvalidInputError(`role names (${resourcesNotFound.join(',')}) are not valid`);
        }
      }

      const user = await updateUserById(userId, {
        ...body,
      });

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

      await findUserById(userId);

      await deleteUserById(userId);

      ctx.status = 204;

      return next();
    }
  );

  router.patch(
    '/users/:userId/custom-data',
    koaGuard({
      params: object({ userId: string() }),
      body: object({ customData: arbitraryObjectGuard }),
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

      ctx.body = pick(user, ...userInfoSelectFields);

      return next();
    }
  );

  router.delete(
    '/users/:userId/custom-data',
    koaGuard({
      params: object({ userId: string() }),
    }),
    async (ctx, next) => {
      const {
        params: { userId },
      } = ctx.guard;

      await findUserById(userId);

      await clearUserCustomDataById(userId);

      ctx.status = 200;

      return next();
    }
  );

  router.delete(
    '/users/:userId/identities/:connectorId',
    koaGuard({ params: object({ userId: string(), connectorId: string() }) }),
    async (ctx, next) => {
      const {
        params: { userId, connectorId },
      } = ctx.guard;

      const { identities } = await findUserById(userId);

      if (!has(identities, connectorId)) {
        throw new RequestError({ code: 'user.identity_not_exists', status: 404 });
      }

      const updatedUser = await deleteUserIdentity(userId, connectorId);
      ctx.body = pick(updatedUser, ...userInfoSelectFields);

      return next();
    }
  );
}
