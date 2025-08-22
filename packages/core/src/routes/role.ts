import type { RoleResponse } from '@logto/schemas';
import { RoleType, Roles, featuredApplicationGuard, featuredUserGuard } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { pickState, trySafe, tryThat } from '@silverhand/essentials';
import { number, object, string, z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { buildManagementApiContext } from '#src/libraries/hook/utils.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import koaRoleRlsErrorHandler from '#src/middleware/koa-role-rls-error-handler.js';
import assertThat from '#src/utils/assert-that.js';
import { parseSearchParamsForSearch } from '#src/utils/search.js';

import { EnvSet } from '../env-set/index.js';

import roleApplicationRoutes from './role.application.js';
import roleUserRoutes from './role.user.js';
import type { ManagementApiRouter, RouterInitArgs } from './types.js';

export default function roleRoutes<T extends ManagementApiRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const { queries, libraries } = tenant;
  const {
    rolesScopes: { insertRolesScopes },
    scopes: { findScopesByIds },
    roles: {
      countRoles,
      deleteRoleById,
      findRoleById,
      findRoleByRoleName,
      findRoles,
      insertRole,
      updateRoleById,
    },
    users: { findUsersByIds },
    usersRoles: { countUsersRolesByRoleId, findUsersRolesByRoleId, findUsersRolesByUserId },
    applications: { findApplicationsByIds },
    applicationsRoles: {
      countApplicationsRolesByRoleId,
      findApplicationsRolesByRoleId,
      findApplicationsRolesByApplicationId,
    },
  } = queries;
  const {
    quota,
    roleScopes: { validateRoleScopeAssignment },
  } = libraries;

  router.use('/roles(/.*)?', koaRoleRlsErrorHandler());

  router.get(
    '/roles',
    koaPagination(),
    koaGuard({
      query: object({
        excludeUserId: string().optional(),
        excludeApplicationId: string().optional(),
      }).merge(Roles.guard.pick({ type: true }).partial()),
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
      const { type, excludeUserId, excludeApplicationId } = ctx.guard.query;

      return tryThat(
        async () => {
          const search = parseSearchParamsForSearch(searchParams);

          const usersRoles = excludeUserId ? await findUsersRolesByUserId(excludeUserId) : [];

          const applicationsRoles = excludeApplicationId
            ? await findApplicationsRolesByApplicationId(excludeApplicationId)
            : [];

          const excludeRoleIds = [
            ...usersRoles.map(({ roleId }) => roleId),
            ...applicationsRoles.map(({ roleId }) => roleId),
          ];

          const [{ count }, roles] = await Promise.all([
            countRoles(search, { excludeRoleIds, type }),
            findRoles(search, limit, offset, { excludeRoleIds, type }),
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
    koaGuard({
      body: Roles.createGuard
        .omit({ id: true })
        .extend({ scopeIds: z.string().min(1).array().optional() }),
      status: [200, 400, 404, 422], // Throws 404 when invalid `scopeId(s)` are provided.
      response: Roles.guard,
    }),
    async (ctx, next) => {
      const { body } = ctx.guard;
      const { scopeIds, ...roleBody } = body;

      // `rolesLimit` is actually the limit of user roles, keep this name for backward compatibility.
      // We have optional `type` when creating a new role, if `type` is not provided, use `User` as default.
      // `machineToMachineRolesLimit` is the limit of machine to machine roles, and is independent to `rolesLimit`.
      await quota.guardTenantUsageByKey(
        roleBody.type === RoleType.MachineToMachine
          ? 'machineToMachineRolesLimit'
          : // In new pricing model, we rename `rolesLimit` to `userRolesLimit`, which is easier to be distinguished from `machineToMachineRolesLimit`.
            'userRolesLimit'
      );

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
        // Skip scope existence check because the role is newly created.
        await validateRoleScopeAssignment(scopeIds, role.id, { skipScopeExistenceCheck: true });
        await insertRolesScopes(
          scopeIds.map((scopeId) => ({ id: generateStandardId(), roleId: role.id, scopeId }))
        );
      }

      // TODO: remove this dev feature guard when new pro plan and add-on skus are ready.
      if (EnvSet.values.isDevFeaturesEnabled) {
        void quota.reportSubscriptionUpdatesUsage(
          role.type === RoleType.MachineToMachine ? 'machineToMachineRolesLimit' : 'userRolesLimit'
        );
      }

      ctx.body = role;

      // Hook context must be triggered after the response is set.
      if (scopeIds) {
        // Trigger the `Role.Scopes.Updated` event if scopeIds are provided. Should not break the request
        await trySafe(async () => {
          // Align the response type with POST /roles/:id/scopes
          const newRolesScopes = await findScopesByIds(scopeIds);

          ctx.appendDataHookContext('Role.Scopes.Updated', {
            ...buildManagementApiContext(ctx),
            roleId: role.id,
            data: newRolesScopes,
          });
        });
      }

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
      body: Roles.createGuard.pick({ name: true, description: true, isDefault: true }).partial(),
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

      // Check if role is available, and get role type before deleting the role
      const role = await findRoleById(id);

      await deleteRoleById(id);

      if (EnvSet.values.isDevFeaturesEnabled) {
        void quota.reportSubscriptionUpdatesUsage(
          role.type === RoleType.MachineToMachine ? 'machineToMachineRolesLimit' : 'userRolesLimit'
        );
      }

      ctx.status = 204;

      return next();
    }
  );

  roleUserRoutes(router, tenant);
  roleApplicationRoutes(router, tenant);
}
