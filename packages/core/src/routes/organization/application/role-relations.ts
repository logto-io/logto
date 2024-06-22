import { OrganizationRoles } from '@logto/schemas';
import type Router from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { type WithHookContext } from '#src/middleware/koa-management-api-hooks.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import type OrganizationQueries from '#src/queries/organization/index.js';

// Consider building a class to handle these relations. See `index.user-role-relations.ts` for more information.
export default function applicationRoleRelationRoutes(
  router: Router<unknown, WithHookContext>,
  organizations: OrganizationQueries
) {
  const params = Object.freeze({
    id: z.string().min(1),
    applicationId: z.string().min(1),
  } as const);
  const pathname = '/:id/applications/:applicationId/roles';

  // The pathname of `.use()` will not match the end of the path, for example:
  // `.use('/foo', ...)` will match both `/foo` and `/foo/bar`.
  // See https://github.com/koajs/router/blob/02ad6eedf5ced6ec1eab2138380fd67c63e3f1d7/lib/router.js#L330-L333
  router.use(pathname, koaGuard({ params: z.object(params) }), async (ctx, next) => {
    const { id, applicationId } = ctx.guard.params;

    // Ensure membership
    if (!(await organizations.relations.apps.exists({ organizationId: id, applicationId }))) {
      throw new RequestError({ code: 'organization.require_membership', status: 422 });
    }

    return next();
  });

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
