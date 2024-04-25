import { RoleType, Roles } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { tryThat } from '@silverhand/essentials';
import { array, object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import koaRoleRlsErrorHandler from '#src/middleware/koa-role-rls-error-handler.js';
import assertThat from '#src/utils/assert-that.js';
import { parseSearchParamsForSearch } from '#src/utils/search.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

export default function adminUserRoleRoutes<T extends ManagementApiRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const {
    roles: { findRoleById, countRoles, findRoles, findRolesByRoleIds },
    users: { findUserById },
    usersRoles: { deleteUsersRolesByUserIdAndRoleId, findUsersRolesByUserId, insertUsersRoles },
  } = queries;

  router.use('/users/:userId/roles(/.*)?', koaRoleRlsErrorHandler());

  router.get(
    '/users/:userId/roles',
    koaPagination(),
    koaGuard({
      params: object({ userId: string() }),
      response: array(Roles.guard),
      status: [200, 400, 404],
    }),
    async (ctx, next) => {
      const { userId } = ctx.guard.params;
      const { limit, offset } = ctx.pagination;
      const { searchParams } = ctx.request.URL;

      await findUserById(userId);

      return tryThat(
        async () => {
          const search = parseSearchParamsForSearch(searchParams);
          const usersRoles = await findUsersRolesByUserId(userId);
          const roleIds = usersRoles.map(({ roleId }) => roleId);
          const [{ count }, roles] = await Promise.all([
            countRoles(search, { roleIds, type: RoleType.User }),
            findRoles(search, limit, offset, { roleIds, type: RoleType.User }),
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
      status: [201, 404, 422],
    }),
    async (ctx, next) => {
      const {
        params: { userId },
        body: { roleIds },
      } = ctx.guard;

      await findUserById(userId);
      const usersRoles = await findUsersRolesByUserId(userId);
      const existingRoleIds = new Set(usersRoles.map(({ roleId }) => roleId));
      const roleIdsToAdd = roleIds.filter((id) => !existingRoleIds.has(id)); // ignore existing roles.
      const roles = await findRolesByRoleIds(roleIdsToAdd);

      for (const role of roles) {
        assertThat(
          role.type === RoleType.User,
          new RequestError({ code: 'user.invalid_role_type', status: 422, roleId: role.id })
        );
      }

      if (roleIdsToAdd.length > 0) {
        await Promise.all(roleIdsToAdd.map(async (roleId) => findRoleById(roleId)));
        await insertUsersRoles(
          roleIdsToAdd.map((roleId) => ({ id: generateStandardId(), userId, roleId }))
        );
      }

      ctx.status = 201;

      return next();
    }
  );

  router.put(
    '/users/:userId/roles',
    koaGuard({
      params: object({ userId: string() }),
      body: object({ roleIds: string().min(1).array() }),
      status: [200, 404, 422],
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
      status: [204, 404],
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
