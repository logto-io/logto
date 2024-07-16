import {
  type CreateOrganization,
  type Organization,
  type OrganizationKeys,
  OrganizationRoles,
  OrganizationScopes,
} from '@logto/schemas';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import type OrganizationQueries from '#src/queries/organization/index.js';
import type SchemaRouter from '#src/utils/SchemaRouter.js';

// Manually add these routes since I don't want to over-engineer the `SchemaRouter`.
// Update: Now we also have "organization - organization role - application" relations. Consider
// extracting the common logic to a class once we have one more relation like this.
export default function userRoleRelationRoutes(
  router: SchemaRouter<OrganizationKeys, CreateOrganization, Organization>,
  organizations: OrganizationQueries
) {
  const params = Object.freeze({ id: z.string().min(1), userId: z.string().min(1) } as const);
  const pathname = '/:id/users/:userId/roles';

  // The pathname of `.use()` will not match the end of the path, for example:
  // `.use('/foo', ...)` will match both `/foo` and `/foo/bar`.
  // See https://github.com/koajs/router/blob/02ad6eedf5ced6ec1eab2138380fd67c63e3f1d7/lib/router.js#L330-L333
  router.use(pathname, koaGuard({ params: z.object(params) }), async (ctx, next) => {
    const { id, userId } = ctx.guard.params;

    // Ensure membership
    if (!(await organizations.relations.users.exists({ organizationId: id, userId }))) {
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
      const { id, userId } = ctx.guard.params;

      const [totalCount, entities] = await organizations.relations.usersRoles.getEntities(
        OrganizationRoles,
        {
          organizationId: id,
          userId,
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
      body: z.object({ organizationRoleIds: z.string().min(1).array().nonempty() }),
      status: [201, 422],
    }),
    async (ctx, next) => {
      const { id, userId } = ctx.guard.params;
      const { organizationRoleIds } = ctx.guard.body;

      await organizations.relations.usersRoles.insert(
        ...organizationRoleIds.map((roleId) => ({
          organizationId: id,
          organizationRoleId: roleId,
          userId,
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
      body: z.object({ organizationRoleIds: z.string().min(1).array() }),
      status: [204, 422],
    }),
    async (ctx, next) => {
      const { id, userId } = ctx.guard.params;
      const { organizationRoleIds } = ctx.guard.body;

      await organizations.relations.usersRoles.replace(id, userId, organizationRoleIds);

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
      const { id, organizationRoleId, userId } = ctx.guard.params;

      await organizations.relations.usersRoles.delete({
        organizationId: id,
        organizationRoleId,
        userId,
      });

      ctx.status = 204;
      return next();
    }
  );

  router.get(
    '/:id/users/:userId/scopes',
    koaGuard({
      params: z.object(params),
      response: z.array(OrganizationScopes.guard),
      status: [200, 422],
    }),
    async (ctx, next) => {
      const { id, userId } = ctx.guard.params;

      const scopes = await organizations.relations.usersRoles.getUserScopes(id, userId);

      ctx.body = scopes;
      return next();
    }
  );
}
