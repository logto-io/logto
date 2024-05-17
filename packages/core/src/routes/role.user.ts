import { UsersRoles, userInfoSelectFields, userProfileResponseGuard } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { pick, tryThat } from '@silverhand/essentials';
import { object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { type UserConditions } from '#src/queries/user.js';
import { parseSearchParamsForSearch } from '#src/utils/search.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

export default function roleUserRoutes<T extends ManagementApiRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const {
    roles: { findRoleById },
    users: { findUserById, countUsers, findUsers },
    usersRoles: {
      deleteUsersRolesByUserIdAndRoleId,
      findFirstUsersRolesByRoleIdAndUserIds,
      insertUsersRoles,
    },
  } = queries;

  router.get(
    '/roles/:id/users',
    koaPagination(),
    koaGuard({
      params: object({ id: string().min(1) }),
      response: userProfileResponseGuard.array(),
      status: [200, 400, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;
      const { limit, offset } = ctx.pagination;
      const { searchParams } = ctx.request.URL;

      await findRoleById(id);

      return tryThat(
        async () => {
          const conditions: UserConditions = {
            search: parseSearchParamsForSearch(searchParams),
            relation: {
              table: UsersRoles.table,
              field: UsersRoles.fields.roleId,
              value: id,
              type: 'exists',
            },
          };

          const [{ count }, users] = await Promise.all([
            countUsers(conditions),
            findUsers(limit, offset, conditions),
          ]);

          ctx.pagination.totalCount = count;
          ctx.body = users.map((user) => pick(user, ...userInfoSelectFields));

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
    '/roles/:id/users',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: object({ userIds: string().min(1).array().nonempty() }),
      status: [201, 404, 422],
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body: { userIds },
      } = ctx.guard;

      await findRoleById(id);
      const existingRecord = await findFirstUsersRolesByRoleIdAndUserIds(id, userIds);

      if (existingRecord) {
        throw new RequestError({
          code: 'role.user_exists',
          status: 422,
          userId: existingRecord.userId,
        });
      }

      await Promise.all(userIds.map(async (userId) => findUserById(userId)));
      await insertUsersRoles(
        userIds.map((userId) => ({ id: generateStandardId(), roleId: id, userId }))
      );
      ctx.status = 201;

      return next();
    }
  );

  router.delete(
    '/roles/:id/users/:userId',
    koaGuard({
      params: object({ id: string().min(1), userId: string().min(1) }),
      status: [204, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id, userId },
      } = ctx.guard;
      await deleteUsersRolesByUserIdAndRoleId(userId, id);
      ctx.status = 204;

      return next();
    }
  );
}
