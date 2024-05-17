import {
  OrganizationRoles,
  type OrganizationWithFeatured,
  Organizations,
  featuredUserGuard,
  userWithOrganizationRolesGuard,
  OrganizationScopes,
} from '@logto/schemas';
import { yes } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import koaQuotaGuard from '#src/middleware/koa-quota-guard.js';
import { userSearchKeys } from '#src/queries/user.js';
import SchemaRouter from '#src/utils/SchemaRouter.js';
import { parseSearchOptions } from '#src/utils/search.js';

import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

import organizationInvitationRoutes from './invitations.js';
import organizationRoleRoutes from './roles.js';
import organizationScopeRoutes from './scopes.js';
import { errorHandler } from './utils.js';

export default function organizationRoutes<T extends ManagementApiRouter>(
  ...args: RouterInitArgs<T>
) {
  const [
    originalRouter,
    {
      queries: { organizations },
      libraries: { quota },
    },
  ] = args;

  const router = new SchemaRouter(Organizations, organizations, {
    middlewares: [koaQuotaGuard({ key: 'organizationsEnabled', quota, methods: ['POST', 'PUT'] })],
    errorHandler,
    searchFields: ['name'],
    disabled: { get: true },
    idLength: 12,
  });

  router.get(
    '/',
    koaPagination(),
    koaGuard({
      query: z.object({ q: z.string().optional(), showFeatured: z.string().optional() }),
      response: (
        Organizations.guard.merge(
          // For `showFeatured` query
          z
            .object({
              usersCount: z.number(),
              featuredUsers: featuredUserGuard.array(),
            })
            .partial()
        ) satisfies z.ZodType<OrganizationWithFeatured>
      ).array(),
      status: [200],
    }),
    async (ctx, next) => {
      const { query } = ctx.guard;
      const search = parseSearchOptions(['id', 'name'], query);
      const { limit, offset } = ctx.pagination;
      const [count, entities] = await organizations.findAll(limit, offset, search);

      ctx.pagination.totalCount = count;
      ctx.body = yes(query.showFeatured)
        ? await Promise.all(
            entities.map(async (entity) => {
              const [usersCount, featuredUsers] = await organizations.relations.users.getFeatured(
                entity.id
              );
              return { ...entity, usersCount, featuredUsers };
            })
          )
        : entities;
      return next();
    }
  );

  // MARK: Organization - user relation routes
  router.addRelationRoutes(organizations.relations.users, undefined, { disabled: { get: true } });

  router.get(
    '/:id/users',
    koaPagination(),
    koaGuard({
      query: z.object({ q: z.string().optional() }),
      params: z.object({ id: z.string().min(1) }),
      response: userWithOrganizationRolesGuard.array(),
      status: [200, 404],
    }),
    async (ctx, next) => {
      const search = parseSearchOptions(userSearchKeys, ctx.guard.query);

      const [totalCount, entities] = await organizations.relations.users.getUsersByOrganizationId(
        ctx.guard.params.id,
        ctx.pagination,
        search
      );

      ctx.pagination.totalCount = totalCount;
      ctx.body = entities;

      return next();
    }
  );

  router.post(
    '/:id/users/roles',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      body: z.object({
        userIds: z.string().min(1).array().nonempty(),
        organizationRoleIds: z.string().min(1).array().nonempty(),
      }),
      status: [201, 422],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      const { userIds, organizationRoleIds } = ctx.guard.body;

      await organizations.relations.rolesUsers.insert(
        ...organizationRoleIds.flatMap<[string, string, string]>((roleId) =>
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

  // The pathname of `.use()` will not match the end of the path, for example:
  // `.use('/foo', ...)` will match both `/foo` and `/foo/bar`.
  // See https://github.com/koajs/router/blob/02ad6eedf5ced6ec1eab2138380fd67c63e3f1d7/lib/router.js#L330-L333
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

  router.get(
    '/:id/users/:userId/scopes',
    koaGuard({
      params: z.object(params),
      response: z.array(OrganizationScopes.guard),
      status: [200, 422],
    }),
    async (ctx, next) => {
      const { id, userId } = ctx.guard.params;

      const scopes = await organizations.relations.rolesUsers.getUserScopes(id, userId);

      ctx.body = scopes;
      return next();
    }
  );

  // MARK: Mount sub-routes
  organizationRoleRoutes(...args);
  organizationScopeRoutes(...args);
  organizationInvitationRoutes(...args);

  // Add routes to the router
  originalRouter.use(router.routes());
}
