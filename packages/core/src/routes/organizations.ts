import { OrganizationRoles, Organizations } from '@logto/schemas';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import SchemaRouter, { SchemaActions } from '#src/utils/SchemaRouter.js';

import { type AuthedRouter, type RouterInitArgs } from './types.js';

export default function organizationRoutes<T extends AuthedRouter>(
  ...[
    originalRouter,
    {
      queries: { organizations, users },
    },
  ]: RouterInitArgs<T>
) {
  const router = new SchemaRouter(Organizations, new SchemaActions(organizations));

  router.addRelationRoutes(organizations.relations.users);

  // Manually add these routes since I don't want to over-engineer the `SchemaRouter`
  // MARK: Organization - user - organization role relation routes
  const params = Object.freeze({ id: z.string().min(1), userId: z.string().min(1) } as const);
  const pathname = '/:id/users/:userId/roles';

  router.get(
    pathname,
    koaGuard({
      params: z.object(params),
      response: OrganizationRoles.guard.array(),
      status: [200, 404],
    }),
    // TODO: Add pagination
    async (ctx, next) => {
      const { id, userId } = ctx.guard.params;

      // Ensure both the organization and the role exist
      await Promise.all([organizations.findById(id), users.findUserById(userId)]);

      ctx.body = await organizations.relations.rolesUsers.getEntries(OrganizationRoles, {
        organizationId: id,
        userId,
      });
      return next();
    }
  );

  router.post(
    pathname,
    koaGuard({
      params: z.object(params),
      body: z.object({ roleIds: z.string().min(1).array().nonempty() }),
      status: [201, 404, 422],
    }),
    async (ctx, next) => {
      const { id, userId } = ctx.guard.params;
      const { roleIds } = ctx.guard.body;

      // Ensure membership
      if (!(await organizations.relations.users.exists(id, userId))) {
        throw new RequestError({ code: 'organization.require_membership', status: 422 });
      }

      await organizations.relations.rolesUsers.insert(
        ...roleIds.map<[string, string, string]>((roleId) => [id, roleId, userId])
      );

      ctx.status = 201;
      return next();
    }
  );

  router.delete(
    `${pathname}/:roleId`,
    koaGuard({
      params: z.object({ ...params, roleId: z.string().min(1) }),
      status: [204, 404],
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

  originalRouter.use(router.routes());
}
