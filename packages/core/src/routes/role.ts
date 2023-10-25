import type { RoleResponse } from '@logto/schemas';
import { Roles, featuredApplicationGuard, featuredUserGuard } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { pickState, tryThat } from '@silverhand/essentials';
import { object, string, z, number } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import koaQuotaGuard from '#src/middleware/koa-quota-guard.js';
import koaRoleRlsErrorHandler from '#src/middleware/koa-role-rls-error-handler.js';
import assertThat from '#src/utils/assert-that.js';
import { parseSearchParamsForSearch } from '#src/utils/search.js';

import roleApplicationRoutes from './role.application.js';
import roleUserRoutes from './role.user.js';
import type { AuthedRouter, RouterInitArgs } from './types.js';

export default function roleRoutes<T extends AuthedRouter>(...[router, tenant]: RouterInitArgs<T>) {
  const {
    queries,
    libraries: { quota },
  } = tenant;
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
    users: { findUsersByIds },
    usersRoles: { countUsersRolesByRoleId, findUsersRolesByRoleId, findUsersRolesByUserId },
    applications: { findApplicationsByIds },
    applicationsRoles: {
      countApplicationsRolesByRoleId,
      findApplicationsRolesByRoleId,
      findApplicationsRolesByApplicationId,
    },
  } = queries;

  router.use('/roles(/.*)?', koaRoleRlsErrorHandler());

  router.get(
    '/roles',
    koaPagination(),
    koaGuard({
      response: Roles.guard
        .merge(
          object({
            usersCount: number(),
            featuredUsers: featuredUserGuard.array(),
            applicationsCount: number(),
            featuredApplications: featuredApplicationGuard.array(),
          })
        )
        .array(),
      status: [200, 400],
    }),
    async (ctx, next) => {
      const { limit, offset } = ctx.pagination;
      const { searchParams } = ctx.request.URL;

      return tryThat(
        async () => {
          const search = parseSearchParamsForSearch(searchParams);

          const excludeUserId = searchParams.get('excludeUserId');
          const usersRoles = excludeUserId ? await findUsersRolesByUserId(excludeUserId) : [];

          const excludeApplicationId = searchParams.get('excludeApplicationId');
          const applicationsRoles = excludeApplicationId
            ? await findApplicationsRolesByApplicationId(excludeApplicationId)
            : [];

          const excludeRoleIds = [
            ...usersRoles.map(({ roleId }) => roleId),
            ...applicationsRoles.map(({ roleId }) => roleId),
          ];

          const [{ count }, roles] = await Promise.all([
            countRoles(search, { excludeRoleIds }),
            findRoles(search, limit, offset, { excludeRoleIds }),
          ]);

          const rolesResponse: RoleResponse[] = await Promise.all(
            roles.map(async (role) => {
              const { count: usersCount } = await countUsersRolesByRoleId(role.id);
              const usersRoles = await findUsersRolesByRoleId(role.id, 3);
              const users = await findUsersByIds(usersRoles.map(({ userId }) => userId));

              const { count: applicationsCount } = await countApplicationsRolesByRoleId(role.id);
              const applicationsRoles = await findApplicationsRolesByRoleId(role.id, 3);
              const applications = await findApplicationsByIds(
                applicationsRoles.map(({ applicationId }) => applicationId)
              );

              return {
                ...role,
                usersCount,
                featuredUsers: users.map(pickState('id', 'avatar', 'name')),
                applicationsCount,
                featuredApplications: applications.map(pickState('id', 'name', 'type')),
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
    '/roles',
    koaQuotaGuard({ key: 'rolesLimit', quota }),
    koaGuard({
      body: Roles.createGuard
        .omit({ id: true })
        .extend({ scopeIds: z.string().min(1).array().optional() }),
      status: [200, 422],
      response: Roles.guard,
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
      response: Roles.guard,
      status: [200, 404],
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
      response: Roles.guard,
      status: [200, 404, 422],
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
      status: [204, 404],
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

  roleUserRoutes(router, tenant);
  roleApplicationRoutes(router, tenant);
}
