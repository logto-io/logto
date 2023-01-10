import { buildIdGenerator } from '@logto/core-kit';
import type { RoleResponse, ScopeResponse } from '@logto/schemas';
import { Roles } from '@logto/schemas';
import { tryThat } from '@logto/shared';
import { object, string, z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { findResourcesByIds } from '#src/queries/resource.js';
import {
  deleteRolesScope,
  findRolesScopesByRoleId,
  insertRolesScopes,
} from '#src/queries/roles-scopes.js';
import {
  countRoles,
  deleteRoleById,
  findRoleById,
  findRoleByRoleName,
  findRoles,
  insertRole,
  updateRoleById,
} from '#src/queries/roles.js';
import { findScopeById, findScopesByIds } from '#src/queries/scope.js';
import { findUserById, findUsersByIds } from '#src/queries/user.js';
import {
  countUsersRolesByRoleId,
  deleteUsersRolesByUserIdAndRoleId,
  findFirstUsersRolesByRoleIdAndUserIds,
  findUsersRolesByRoleId,
  findUsersRolesByUserId,
  insertUsersRoles,
} from '#src/queries/users-roles.js';
import assertThat from '#src/utils/assert-that.js';
import { parseSearchParamsForSearch } from '#src/utils/search.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

const roleId = buildIdGenerator(21);

export default function roleRoutes<T extends AuthedRouter>(...[router]: RouterInitArgs<T>) {
  router.get('/roles', koaPagination({ isOptional: true }), async (ctx, next) => {
    const { limit, offset, disabled } = ctx.pagination;
    const { searchParams } = ctx.request.URL;

    return tryThat(
      async () => {
        const search = parseSearchParamsForSearch(searchParams);
        const excludeUserId = searchParams.get('excludeUserId');
        const usersRoles = excludeUserId ? await findUsersRolesByUserId(excludeUserId) : [];
        const excludeRoleIds = usersRoles.map(({ roleId }) => roleId);

        if (disabled) {
          ctx.body = await findRoles(search, excludeRoleIds);

          return next();
        }

        const [{ count }, roles] = await Promise.all([
          countRoles(search, excludeRoleIds),
          findRoles(search, excludeRoleIds, limit, offset),
        ]);

        const rolesResponse: RoleResponse[] = await Promise.all(
          roles.map(async (role) => {
            const { count } = await countUsersRolesByRoleId(role.id);
            const usersRoles = await findUsersRolesByRoleId(role.id, 3);
            const users = await findUsersByIds(usersRoles.map(({ userId }) => userId));

            return {
              ...role,
              usersCount: count,
              featuredUsers: users.map(({ id, avatar }) => ({ id, avatar })),
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
        })
      );

      const role = await insertRole({
        ...roleBody,
        id: roleId(),
      });

      if (scopeIds) {
        await Promise.all(scopeIds.map(async (scopeId) => findScopeById(scopeId)));
        await insertRolesScopes(scopeIds.map((scopeId) => ({ roleId: role.id, scopeId })));
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
      assertThat(!name || !(await findRoleByRoleName(name, id)), 'role.name_in_use');
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
    '/roles/:id/scopes',
    koaGuard({
      params: object({ id: string().min(1) }),
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      await findRoleById(id);
      const rolesScopes = await findRolesScopesByRoleId(id);
      const scopes = await findScopesByIds(rolesScopes.map(({ scopeId }) => scopeId));
      const resources = await findResourcesByIds(scopes.map(({ resourceId }) => resourceId));
      const result: ScopeResponse[] = scopes.map((scope) => {
        const resource = resources.find(({ id }) => scope.resourceId);

        assertThat(resource, new Error(`Cannot find resource for id ${scope.resourceId}`));

        return {
          ...scope,
          resource,
        };
      });

      ctx.body = result;

      return next();
    }
  );

  router.post(
    '/roles/:id/scopes',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: object({ scopeIds: string().min(1).array() }),
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body: { scopeIds },
      } = ctx.guard;

      await findRoleById(id);
      const rolesScopes = await findRolesScopesByRoleId(id);

      for (const scopeId of scopeIds) {
        assertThat(
          !rolesScopes.some(({ scopeId: _scopeId }) => _scopeId === scopeId),
          new RequestError({
            code: 'role.scope_exists',
            status: 422,
            scopeId,
          })
        );
      }

      await Promise.all(scopeIds.map(async (scopeId) => findScopeById(scopeId)));
      await insertRolesScopes(scopeIds.map((scopeId) => ({ roleId: id, scopeId })));
      ctx.status = 201;

      return next();
    }
  );

  router.delete(
    '/roles/:id/scopes/:scopeId',
    koaGuard({
      params: object({ id: string().min(1), scopeId: string().min(1) }),
    }),
    async (ctx, next) => {
      const {
        params: { id, scopeId },
      } = ctx.guard;
      await deleteRolesScope(id, scopeId);
      ctx.status = 204;

      return next();
    }
  );

  router.get(
    '/roles/:id/users',
    koaGuard({
      params: object({ id: string().min(1) }),
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      await findRoleById(id);
      const usersRoles = await findUsersRolesByRoleId(id);
      ctx.body = await findUsersByIds(usersRoles.map(({ userId }) => userId));

      return next();
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
      await insertUsersRoles(userIds.map((userId) => ({ roleId: id, userId })));
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
