import { ApplicationType, RoleType, Roles } from '@logto/schemas';
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

export default function applicationRoleRoutes<T extends ManagementApiRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const {
    roles: { findRoleById, countRoles, findRoles, findRolesByRoleIds },
    applications: { findApplicationById },
    applicationsRoles: {
      findApplicationsRolesByApplicationId,
      insertApplicationsRoles,
      deleteApplicationRole,
    },
  } = queries;

  router.use('/applications/:applicationId/roles(/.*)?', koaRoleRlsErrorHandler());

  router.get(
    '/applications/:applicationId/roles',
    koaPagination(),
    koaGuard({
      params: object({ applicationId: string() }),
      response: array(Roles.guard),
      status: [200, 400, 404, 422],
    }),
    async (ctx, next) => {
      const { applicationId } = ctx.guard.params;
      const { limit, offset } = ctx.pagination;
      const { searchParams } = ctx.request.URL;

      const application = await findApplicationById(applicationId);
      assertThat(
        application.type === ApplicationType.MachineToMachine,
        new RequestError({
          code: 'application.invalid_type',
          status: 422,
        })
      );

      return tryThat(
        async () => {
          const search = parseSearchParamsForSearch(searchParams);
          const applicationRoles = await findApplicationsRolesByApplicationId(applicationId);
          const roleIds = applicationRoles.map(({ roleId }) => roleId);
          const [{ count }, roles] = await Promise.all([
            countRoles(search, { roleIds, type: RoleType.MachineToMachine }),
            findRoles(search, limit, offset, { roleIds, type: RoleType.MachineToMachine }),
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
    '/applications/:applicationId/roles',
    koaGuard({
      params: object({ applicationId: string() }),
      body: object({ roleIds: string().min(1).array() }),
      status: [201, 404, 422],
    }),
    async (ctx, next) => {
      const {
        params: { applicationId },
        body: { roleIds },
      } = ctx.guard;

      const application = await findApplicationById(applicationId);
      assertThat(
        application.type === ApplicationType.MachineToMachine,
        new RequestError({
          code: 'application.invalid_type',
          status: 422,
        })
      );
      const applicationRoles = await findApplicationsRolesByApplicationId(applicationId);

      const roles = await findRolesByRoleIds(roleIds);

      for (const role of roles) {
        assertThat(
          !applicationRoles.some(({ roleId: _roleId }) => _roleId === role.id),
          new RequestError({
            code: 'application.role_exists',
            status: 422,
            roleId: role.id,
          })
        );
        assertThat(
          role.type === RoleType.MachineToMachine,
          new RequestError({
            code: 'application.invalid_role_type',
            status: 422,
          })
        );
      }

      await Promise.all(roleIds.map(async (roleId) => findRoleById(roleId)));
      await insertApplicationsRoles(
        roleIds.map((roleId) => ({ id: generateStandardId(), applicationId, roleId }))
      );
      ctx.status = 201;

      return next();
    }
  );

  router.put(
    '/applications/:applicationId/roles',
    koaGuard({
      params: object({ applicationId: string() }),
      body: object({ roleIds: string().min(1).array() }),
      status: [200, 404, 422],
    }),
    async (ctx, next) => {
      const {
        params: { applicationId },
        body: { roleIds },
      } = ctx.guard;

      const application = await findApplicationById(applicationId);
      assertThat(
        application.type === ApplicationType.MachineToMachine,
        new RequestError({
          code: 'application.invalid_type',
          status: 422,
        })
      );
      const applicationRoles = await findApplicationsRolesByApplicationId(applicationId);

      // Only add the ones that doesn't exist
      const roleIdsToAdd = roleIds.filter(
        (roleId) => !applicationRoles.some(({ roleId: _roleId }) => _roleId === roleId)
      );
      // Remove existing roles that isn't wanted by app anymore
      const roleIdsToRemove = applicationRoles
        .filter(({ roleId }) => !roleIds.includes(roleId))
        .map(({ roleId }) => roleId);

      await Promise.all(roleIdsToAdd.map(async (roleId) => findRoleById(roleId)));
      await Promise.all(
        roleIdsToRemove.map(async (roleId) => deleteApplicationRole(applicationId, roleId))
      );
      await insertApplicationsRoles(
        roleIdsToAdd.map((roleId) => ({ id: generateStandardId(), applicationId, roleId }))
      );

      ctx.status = 200;

      return next();
    }
  );

  router.delete(
    '/applications/:applicationId/roles/:roleId',
    koaGuard({
      params: object({ applicationId: string(), roleId: string() }),
      status: [204, 404, 422],
    }),
    async (ctx, next) => {
      const {
        params: { applicationId, roleId },
      } = ctx.guard;

      const application = await findApplicationById(applicationId);
      assertThat(
        application.type === ApplicationType.MachineToMachine,
        new RequestError({
          code: 'application.invalid_type',
          status: 422,
        })
      );
      await deleteApplicationRole(applicationId, roleId);

      ctx.status = 204;

      return next();
    }
  );
}
