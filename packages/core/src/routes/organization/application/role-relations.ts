import { OrganizationRoles } from '@logto/schemas';
import type Router from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { type WithAuthContext } from '#src/middleware/koa-auth/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { type WithHookContext } from '#src/middleware/koa-management-api-hooks.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import type OrganizationQueries from '#src/queries/organization/index.js';

// Consider building a class to handle these relations. See `index.user-role-relations.ts` for more information.
export default function applicationRoleRelationRoutes(
  router: Router<unknown, WithHookContext & WithAuthContext>,
  organizations: OrganizationQueries
) {
  const params = Object.freeze({
    id: z.string().min(1),
    applicationId: z.string().min(1),
  } as const);
  const pathname = '/:id/applications/:applicationId/roles';

  const ensureMembership = async (organizationId: string, applicationId: string) => {
    if (!(await organizations.relations.apps.exists({ organizationId, applicationId }))) {
      throw new RequestError({ code: 'organization.require_membership', status: 422 });
    }
  };

  router.get(
    pathname,
    koaPagination({ isOptional: true }),
    koaGuard({
      params: z.object(params),
      response: OrganizationRoles.guard.array(),
      status: [200, 422],
    }),
    async (ctx, next) => {
      const { id, applicationId } = ctx.guard.params;

      await ensureMembership(id, applicationId);

      const [totalCount, entities] = await organizations.relations.appsRoles.getEntities(
        OrganizationRoles,
        {
          organizationId: id,
          applicationId,
        },
        ctx.pagination.disabled ? undefined : ctx.pagination
      );

      if (!ctx.pagination.disabled) {
        ctx.pagination.totalCount = totalCount;
      }

      ctx.body = entities;
      return next();
    }
  );

  router.post(
    pathname,
    koaGuard({
      params: z.object(params),
      body: z.object({
        organizationRoleIds: z.string().min(1).array().nonempty(),
      }),
      status: [201, 422],
    }),
    async (ctx, next) => {
      const { id, applicationId } = ctx.guard.params;
      const { organizationRoleIds } = ctx.guard.body;

      await ensureMembership(id, applicationId);

      await organizations.relations.appsRoles.insert(
        ...organizationRoleIds.map((organizationRoleId) => ({
          organizationId: id,
          applicationId,
          organizationRoleId,
        }))
      );

      ctx.status = 201;
      return next();
    }
  );

  router.put(
    pathname,
    koaGuard({
      params: z.object(params),
      body: z.object({
        organizationRoleIds: z.string().min(1).array().nonempty(),
      }),
      status: [204, 422],
    }),
    async (ctx, next) => {
      const { id, applicationId } = ctx.guard.params;
      const { organizationRoleIds } = ctx.guard.body;

      await ensureMembership(id, applicationId);

      await organizations.relations.appsRoles.replace(id, applicationId, organizationRoleIds);

      ctx.status = 204;
      return next();
    }
  );

  router.delete(
    `${pathname}/:organizationRoleId`,
    koaGuard({
      params: z.object({ ...params, organizationRoleId: z.string().min(1) }),
      status: [204, 422, 404],
    }),
    async (ctx, next) => {
      const { id, applicationId, organizationRoleId } = ctx.guard.params;

      await ensureMembership(id, applicationId);

      await organizations.relations.appsRoles.delete({
        organizationId: id,
        applicationId,
        organizationRoleId,
      });

      ctx.status = 204;
      return next();
    }
  );
}
