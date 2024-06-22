import {
  type OrganizationKeys,
  type CreateOrganization,
  type Organization,
  userWithOrganizationRolesGuard,
} from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import type OrganizationQueries from '#src/queries/organization/index.js';
import { userSearchKeys } from '#src/queries/user.js';
import type SchemaRouter from '#src/utils/SchemaRouter.js';
import { parseSearchOptions } from '#src/utils/search.js';

import userRoleRelationRoutes from './role-relations.js';

/** Mounts the user-related routes on the organization router. */
export default function userRoutes(
  router: SchemaRouter<OrganizationKeys, CreateOrganization, Organization>,
  organizations: OrganizationQueries
) {
  router.addRelationRoutes(organizations.relations.users, undefined, {
    disabled: { get: true },
    hookEvent: 'Organization.Membership.Updated',
  });

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

      await organizations.relations.usersRoles.insert(
        ...organizationRoleIds.flatMap((roleId) =>
          userIds.map((userId) => ({ organizationId: id, organizationRoleId: roleId, userId }))
        )
      );

      ctx.status = 201;
      return next();
    }
  );

  userRoleRelationRoutes(router, organizations);
}
