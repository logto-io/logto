import { object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

export default function adminUserRoleRoutes<T extends AuthedRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const {
    roles: { findRolesByRoleIds, findRoleById },
    users: { findUserById },
    usersRoles: { deleteUsersRolesByUserIdAndRoleId, findUsersRolesByUserId, insertUsersRoles },
  } = queries;

  router.get(
    '/users/:userId/roles',
    koaGuard({
      params: object({ userId: string() }),
    }),
    async (ctx, next) => {
      const {
        params: { userId },
      } = ctx.guard;

      await findUserById(userId);
      const usersRoles = await findUsersRolesByUserId(userId);
      const roles = await findRolesByRoleIds(usersRoles.map(({ roleId }) => roleId));

      ctx.body = roles;

      return next();
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
      await insertUsersRoles(roleIds.map((roleId) => ({ userId, roleId })));
      ctx.status = 201;

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
