import {
  type OrganizationKeys,
  type CreateOrganization,
  type Organization,
  OrganizationRoles,
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
import type Queries from '#src/tenants/Queries.js';
import type SchemaRouter from '#src/utils/SchemaRouter.js';
import { parseSearchOptions } from '#src/utils/search.js';

import userRoleRelationRoutes from './role-relations.js';

/** Mounts the user-related routes on the organization router. */
export default function userRoutes(
  router: SchemaRouter<OrganizationKeys, CreateOrganization, Organization>,
  organizations: OrganizationQueries,
  quota: QuotaLibrary,
  queries: Queries
) {
  const {
    users: { findUserById },
  } = queries;
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
      response: z.object({ userIds: z.string().min(1).array() }),
      status: [201, 403, 422],
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body: { userIds: rawUserIds },
      } = ctx.guard;

      // Dedup the request body and filter against current members so the quota check
      // consumes against the truly-new additions. Without this, duplicates in the body
      // or re-adds of existing members would over-count (`insert` uses ON CONFLICT
      // DO NOTHING, so they do not produce extra rows).
      const userIds = [...new Set(rawUserIds)];
      const existingUserIds = new Set(
        await organizations.relations.users.getExistingUserIds(id, userIds)
      );
      const newUserIds = userIds.filter((userId) => !existingUserIds.has(userId));

      if (newUserIds.length > 0) {
        await quota.guardTenantUsageByKey('usersPerOrganizationLimit', {
          entityId: id,
          consumeUsageCount: newUserIds.length,
        });
      }

      await organizations.relations.users.insert(
        ...userIds.map((userId) => ({ organizationId: id, userId }))
      );

      // Echo the raw request body in the response to preserve master's response shape.
      // The dedup/filter above is purely an internal correctness fix for the quota math.
      ctx.body = { userIds: rawUserIds };
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
        body: { userIds: rawUserIds },
      } = ctx.guard;

      // Dedup the request body before computing the quota delta and before passing to
      // `replace()`. Duplicates would otherwise inflate the delta and cause
      // `replace()` to attempt a primary-key collision on the same (org, user) pair.
      const userIds = [...new Set(rawUserIds)];

      // For replace operation, calculate the delta (new count - current count).
      // Only check quota if we're adding more users than currently exist.
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

      // Membership can grow large; use the delta variant to avoid rewriting all rows.
      await organizations.relations.users.replaceWithDelta(id, userIds);

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

      // Emit one `Organization.UserRoles.Updated` event per affected user so each payload
      // contains the full user + role set for that user in this organization.
      await Promise.all(
        userIds.map(async (userId) => {
          const [user, [, organizationRoles]] = await Promise.all([
            findUserById(userId),
            organizations.relations.usersRoles.getEntities(OrganizationRoles, {
              organizationId: id,
              userId,
            }),
          ]);

          ctx.appendDataHookContext('Organization.UserRoles.Updated', {
            ...buildManagementApiContext(ctx),
            organizationId: id,
            user,
            organizationRoles,
            addedOrganizationRoleIds: organizationRoleIds,
          });
        })
      );

      return next();
    }
  );

  userRoleRelationRoutes(router, organizations, queries);
}
