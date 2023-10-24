import { OrganizationRoles, Organizations, userWithOrganizationRolesGuard } from '@logto/schemas';
import { type Optional, cond } from '@silverhand/essentials';
import { z } from 'zod';

import { type SearchOptions } from '#src/database/utils.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { userSearchKeys } from '#src/queries/user.js';
import SchemaRouter from '#src/utils/SchemaRouter.js';

import { type AuthedRouter, type RouterInitArgs } from '../types.js';

import organizationRoleRoutes from './roles.js';
import organizationScopeRoutes from './scopes.js';
import { errorHandler } from './utils.js';

export default function organizationRoutes<T extends AuthedRouter>(...args: RouterInitArgs<T>) {
  const [
    originalRouter,
    {
      queries: { organizations },
    },
  ] = args;
  const router = new SchemaRouter(Organizations, organizations, {
    errorHandler,
    searchFields: ['name'],
  });

  // MARK: Organization - user relation routes
  router.addRelationRoutes(organizations.relations.users, undefined, { disabled: { get: true } });

  router.get(
    '/:id/users',
    // TODO: support pagination
    koaGuard({
      query: z.object({ q: z.string().optional() }),
      params: z.object({ id: z.string().min(1) }),
      response: userWithOrganizationRolesGuard.array(),
      status: [200, 404],
    }),
    async (ctx, next) => {
      const { q } = ctx.guard.query;
      const search: Optional<SearchOptions<(typeof userSearchKeys)[number]>> = cond(
        q && {
          fields: userSearchKeys,
          keyword: q,
        }
      );
      ctx.body = await organizations.relations.users.getUsersByOrganizationId(
        ctx.guard.params.id,
        search
      );
      return next();
    }
  );

  router.post(
    '/:id/users/roles',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      body: z.object({
        userIds: z.string().min(1).array().nonempty(),
        roleIds: z.string().min(1).array().nonempty(),
      }),
      status: [201, 422],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      const { userIds, roleIds } = ctx.guard.body;

      await organizations.relations.rolesUsers.insert(
        ...roleIds.flatMap<[string, string, string]>((roleId) =>
          userIds.map<[string, string, string]>((userId) => [id, roleId, userId])
        )
      );

      ctx.status = 201;
      return next();
    }
  );

  // Manually add these routes since I don't want to over-engineer the `SchemaRouter`
  // MARK: Organization - user - organization role relation routes
  const params = Object.freeze({ id: z.string().min(1), userId: z.string().min(1) } as const);
  const pathname = '/:id/users/:userId/roles';

  router.use(pathname, koaGuard({ params: z.object(params) }), async (ctx, next) => {
    const { id, userId } = ctx.guard.params;

    // Ensure membership
    if (!(await organizations.relations.users.exists(id, userId))) {
      throw new RequestError({ code: 'organization.require_membership', status: 422 });
    }

    return next();
  });

  router.get(
    pathname,
    koaPagination(),
    koaGuard({
      params: z.object(params),
      response: OrganizationRoles.guard.array(),
      status: [200, 422],
    }),
    async (ctx, next) => {
      const { id, userId } = ctx.guard.params;

      const [totalCount, entities] = await organizations.relations.rolesUsers.getEntities(
        OrganizationRoles,
        {
          organizationId: id,
          userId,
        },
        ctx.pagination
      );

      ctx.pagination.totalCount = totalCount;
      ctx.body = entities;
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

      await organizations.relations.rolesUsers.replace(id, userId, organizationRoleIds);

      ctx.status = 204;
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

      await organizations.relations.rolesUsers.insert(
        ...organizationRoleIds.map<[string, string, string]>((roleId) => [id, roleId, userId])
      );

      ctx.status = 201;
      return next();
    }
  );

  // TODO: check if membership is required in this route
  router.delete(
    `${pathname}/:roleId`,
    koaGuard({
      params: z.object({ ...params, roleId: z.string().min(1) }),
      status: [204, 422, 404],
    }),
    async (ctx, next) => {
      const { id, roleId, userId } = ctx.guard.params;

      await organizations.relations.rolesUsers.delete({
        organizationId: id,
        organizationRoleId: roleId,
        userId,
      });

      ctx.status = 204;
      return next();
    }
  );

  // MARK: Mount sub-routes
  organizationRoleRoutes(...args);
  organizationScopeRoutes(...args);

  // Add routes to the router
  originalRouter.use(router.routes());
}
