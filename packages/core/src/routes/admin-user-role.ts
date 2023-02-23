import { generateStandardId } from '@logto/core-kit';
import { tryThat } from '@logto/shared';
import { object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import assertThat from '#src/utils/assert-that.js';
import { parseSearchParamsForSearch } from '#src/utils/search.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

export default function adminUserRoleRoutes<T extends AuthedRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const {
    roles: { findRoleById, countRoles, findRoles },
    users: { findUserById },
    usersRoles: { deleteUsersRolesByUserIdAndRoleId, findUsersRolesByUserId, insertUsersRoles },
  } = queries;

  router.get(
    '/users/:userId/roles',
    koaPagination(),
    koaGuard({
      params: object({ userId: string() }),
    }),
    async (ctx, next) => {
      const {
        params: { userId },
      } = ctx.guard;
      const { limit, offset } = ctx.pagination;
      const { searchParams } = ctx.request.URL;
      await findUserById(userId);

      return tryThat(
        async () => {
          const search = parseSearchParamsForSearch(searchParams);

          const usersRoles = await findUsersRolesByUserId(userId);
          const roleIds = usersRoles.map(({ roleId }) => roleId);
          const [{ count }, roles] = await Promise.all([
            countRoles(search, { roleIds }),
            findRoles(search, limit, offset, { roleIds }),
          ]);

          // Return totalCount to pagination middleware
          ctx.pagination.totalCount = count;
          ctx.body = roles;

          return next();
        },
        (error) => {
          if (error instanceof TypeError) {
            throw new RequestError(
              { code: 'request.invalid_input', details: error.message },
              error
            );
          }
          throw error;
        }
      );
    }
  );

  router.post(
    '/users/:userId/roles',
    koaGuard({
      params: object({ userId: string() }),
      body: object({ roleIds: string().min(1).array() }),
    }),
    async (ctx, next) => {
      const {
        params: { userId },
        body: { roleIds },
      } = ctx.guard;

      await findUserById(userId);
      const usersRoles = await findUsersRolesByUserId(userId);

      for (const roleId of roleIds) {
        assertThat(
          !usersRoles.some(({ roleId: _roleId }) => _roleId === roleId),
          new RequestError({
            code: 'user.role_exists',
            status: 422,
            roleId,
          })
        );
      }

      await Promise.all(roleIds.map(async (roleId) => findRoleById(roleId)));
      await insertUsersRoles(
        roleIds.map((roleId) => ({ id: generateStandardId(), userId, roleId }))
      );
      ctx.status = 201;

      return next();
    }
  );

  router.patch(
    '/users/:userId/roles',
    koaGuard({
      params: object({ userId: string() }),
      body: object({ roleIds: string().min(1).array() }),
    }),
    async (ctx, next) => {
      const {
        params: { userId },
        body: { roleIds },
      } = ctx.guard;

      await findUserById(userId);
      const usersRoles = await findUsersRolesByUserId(userId);

      // Only add the ones that doesn't exist
      const roleIdsToAdd = roleIds.filter(
        (roleId) => !usersRoles.some(({ roleId: _roleId }) => _roleId === roleId)
      );
      // Remove existing roles that isn't wanted by user anymore
      const roleIdsToRemove = usersRoles
        .filter(({ roleId }) => !roleIds.includes(roleId))
        .map(({ roleId }) => roleId);

      await Promise.all(roleIdsToAdd.map(async (roleId) => findRoleById(roleId)));
      await Promise.all(
        roleIdsToRemove.map(async (roleId) => deleteUsersRolesByUserIdAndRoleId(userId, roleId))
      );
      await insertUsersRoles(
        roleIdsToAdd.map((roleId) => ({ id: generateStandardId(), userId, roleId }))
      );

      ctx.status = 200;

      return next();
    }
  );

  router.delete(
    '/users/:userId/roles/:roleId',
    koaGuard({
      params: object({ userId: string(), roleId: string() }),
    }),
    async (ctx, next) => {
      const {
        params: { userId, roleId },
      } = ctx.guard;

      await deleteUsersRolesByUserIdAndRoleId(userId, roleId);

      ctx.status = 204;

      return next();
    }
  );
}
