import { generateStandardId } from '@logto/core-kit';
import type { RoleResponse } from '@logto/schemas';
import { userInfoSelectFields, Roles } from '@logto/schemas';
import { pick, tryThat } from '@silverhand/essentials';
import { object, string, z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import koaRoleRlsErrorHandler from '#src/middleware/koa-role-rls-error-handler.js';
import assertThat from '#src/utils/assert-that.js';
import { parseSearchParamsForSearch } from '#src/utils/search.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

export default function roleRoutes<T extends AuthedRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const {
    rolesScopes: { insertRolesScopes },
    roles: {
      countRoles,
      deleteRoleById,
      findRoleById,
      findRoleByRoleName,
      findRoles,
      insertRole,
      updateRoleById,
    },
    scopes: { findScopeById },
    users: { findUserById, findUsersByIds, countUsers, findUsers },
    usersRoles: {
      countUsersRolesByRoleId,
      deleteUsersRolesByUserIdAndRoleId,
      findFirstUsersRolesByRoleIdAndUserIds,
      findUsersRolesByRoleId,
      findUsersRolesByUserId,
      insertUsersRoles,
    },
  } = queries;

  router.use('/roles(/.*)?', koaRoleRlsErrorHandler());

  router.get('/roles', koaPagination(), async (ctx, next) => {
    const { limit, offset } = ctx.pagination;
    const { searchParams } = ctx.request.URL;

    return tryThat(
      async () => {
        const search = parseSearchParamsForSearch(searchParams);
        const excludeUserId = searchParams.get('excludeUserId');
        const usersRoles = excludeUserId ? await findUsersRolesByUserId(excludeUserId) : [];
        const excludeRoleIds = usersRoles.map(({ roleId }) => roleId);

        const [{ count }, roles] = await Promise.all([
          countRoles(search, { excludeRoleIds }),
          findRoles(search, limit, offset, { excludeRoleIds }),
        ]);

        const rolesResponse: RoleResponse[] = await Promise.all(
          roles.map(async (role) => {
            const { count } = await countUsersRolesByRoleId(role.id);
            const usersRoles = await findUsersRolesByRoleId(role.id, 3);
            const users = await findUsersByIds(usersRoles.map(({ userId }) => userId));

            return {
              ...role,
              usersCount: count,
              featuredUsers: users.map(({ id, avatar, name }) => ({ id, avatar, name })),
            };
          })
        );

        // Return totalCount to pagination middleware
        ctx.pagination.totalCount = count;
        ctx.body = rolesResponse;

        return next();
      },
      (error) => {
        if (error instanceof TypeError) {
          throw new RequestError({ code: 'request.invalid_input', details: error.message }, error);
        }
        throw error;
      }
    );
  });

  router.post(
    '/roles',
    koaGuard({
      body: Roles.createGuard
        .omit({ id: true })
        .extend({ scopeIds: z.string().min(1).array().optional() }),
    }),
    async (ctx, next) => {
      const { body } = ctx.guard;
      const { scopeIds, ...roleBody } = body;

      assertThat(
        !(await findRoleByRoleName(roleBody.name)),
        new RequestError({
          code: 'role.name_in_use',
          name: roleBody.name,
          status: 422,
        })
      );

      const role = await insertRole({
        ...roleBody,
        id: generateStandardId(),
      });

      if (scopeIds) {
        await Promise.all(scopeIds.map(async (scopeId) => findScopeById(scopeId)));
        await insertRolesScopes(
          scopeIds.map((scopeId) => ({ id: generateStandardId(), roleId: role.id, scopeId }))
        );
      }

      ctx.body = role;

      return next();
    }
  );

  router.get(
    '/roles/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      ctx.body = await findRoleById(id);

      return next();
    }
  );

  router.patch(
    '/roles/:id',
    koaGuard({
      body: Roles.createGuard.pick({ name: true, description: true }).partial(),
      params: object({ id: string().min(1) }),
    }),
    async (ctx, next) => {
      const {
        body,
        body: { name },
        params: { id },
      } = ctx.guard;

      await findRoleById(id);
      assertThat(
        !name || !(await findRoleByRoleName(name, id)),
        new RequestError({
          code: 'role.name_in_use',
          name,
          status: 422,
        })
      );
      ctx.body = await updateRoleById(id, body);

      return next();
    }
  );

  router.delete(
    '/roles/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;
      await deleteRoleById(id);
      ctx.status = 204;

      return next();
    }
  );

  router.get(
    '/roles/:id/users',
    koaPagination(),
    koaGuard({
      params: object({ id: string().min(1) }),
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
          const search = parseSearchParamsForSearch(searchParams);
          const usersRoles = await findUsersRolesByRoleId(id);
          const userIds = usersRoles.map(({ userId }) => userId);

          const [{ count }, users] = await Promise.all([
            countUsers(search, undefined, userIds),
            findUsers(limit, offset, search, undefined, userIds),
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
      body: object({ userIds: string().min(1).array() }),
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
