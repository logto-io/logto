import {
  type OrganizationKeys,
  type CreateOrganization,
  type Organization,
  userWithOrganizationRolesGuard,
  Users,
} from '@logto/schemas';
import { z } from 'zod';

import { buildManagementApiContext } from '#src/libraries/hook/utils.js';
import { type QuotaLibrary } from '#src/libraries/quota.js';
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
  organizations: OrganizationQueries,
  quota: QuotaLibrary
) {
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
    '/:id/users',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      body: z.object({ userIds: z.string().min(1).array().nonempty() }),
      status: [201, 403, 422],
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body: { userIds },
      } = ctx.guard;

      // Check quota limit before adding users
      await quota.guardTenantUsageByKey('usersPerOrganizationLimit', {
        entityId: id,
        consumeUsageCount: userIds.length,
      });

      await organizations.relations.users.insert(
        ...userIds.map((userId) => ({ organizationId: id, userId }))
      );

      ctx.status = 201;

      // Trigger hook event
      ctx.appendDataHookContext('Organization.Membership.Updated', {
        ...buildManagementApiContext(ctx),
        organizationId: id,
      });

      return next();
    }
  );

  router.put(
    '/:id/users',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      body: z.object({ userIds: z.string().min(1).array() }),
      status: [204, 403, 422],
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body: { userIds },
      } = ctx.guard;

      // For replace operation, calculate the delta (new count - current count)
      // Only check quota if we're adding more users than currently exist
      const [currentCount] = await organizations.relations.users.getEntities(Users, {
        organizationId: id,
      });
      const delta = userIds.length - currentCount;

      if (delta > 0) {
        await quota.guardTenantUsageByKey('usersPerOrganizationLimit', {
          entityId: id,
          consumeUsageCount: delta,
        });
      }

      await organizations.relations.users.replace(id, userIds);

      ctx.status = 204;

      // Trigger hook event
      ctx.appendDataHookContext('Organization.Membership.Updated', {
        ...buildManagementApiContext(ctx),
        organizationId: id,
      });

      return next();
    }
  );

  router.delete(
    '/:id/users/:userId',
    koaGuard({
      params: z.object({ id: z.string().min(1), userId: z.string().min(1) }),
      status: [204, 422],
    }),
    async (ctx, next) => {
      const {
        params: { id, userId },
      } = ctx.guard;

      await organizations.relations.users.delete({ organizationId: id, userId });

      ctx.status = 204;

      // Trigger hook event
      ctx.appendDataHookContext('Organization.Membership.Updated', {
        ...buildManagementApiContext(ctx),
        organizationId: id,
      });

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
