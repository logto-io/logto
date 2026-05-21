import {
  type OrganizationKeys,
  type CreateOrganization,
  type Organization,
  applicationWithOrganizationRolesGuard,
} from '@logto/schemas';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import { buildManagementApiContext, truncateMembershipDelta } from '#src/libraries/hook/utils.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { applicationSearchKeys } from '#src/queries/application.js';
import type OrganizationQueries from '#src/queries/organization/index.js';
import type SchemaRouter from '#src/utils/SchemaRouter.js';
import { parseSearchOptions } from '#src/utils/search.js';

import applicationRoleRelationRoutes from './role-relations.js';

/**
 * Org-application membership endpoints. When `isDevFeaturesEnabled` is off we fall
 * back to the generic `addRelationRoutes` mount, which only emits `{ organizationId }`
 * on the membership webhook. When it is on, we own POST/PUT/DELETE so we can include
 * the `addedApplicationIds` / `removedApplicationIds` delta in the payload.
 *
 * The dev-features branch and the legacy fallback should be collapsed once the
 * delta payload graduates to GA (LOG-13467).
 */
const mountMembershipRoutes = (
  router: SchemaRouter<OrganizationKeys, CreateOrganization, Organization>,
  organizations: OrganizationQueries
) => {
  if (!EnvSet.values.isDevFeaturesEnabled) {
    router.addRelationRoutes(organizations.relations.apps, undefined, {
      disabled: { get: true },
      hookEvent: 'Organization.Membership.Updated',
    });
    return;
  }

  router.post(
    '/:id/applications',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      body: z.object({ applicationIds: z.string().min(1).array().nonempty() }),
      status: [201, 422],
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body: { applicationIds: rawApplicationIds },
      } = ctx.guard;

      // Dedup body and filter against current members so the webhook delta only
      // reflects truly-new additions. The base `insert()` uses ON CONFLICT DO NOTHING,
      // so the filter is purely for delta correctness — not for row-level safety.
      const applicationIds = [...new Set(rawApplicationIds)];
      const existingApplicationIds = new Set(
        await organizations.relations.apps.getExistingApplicationIds(id, applicationIds)
      );
      const newApplicationIds = applicationIds.filter(
        (applicationId) => !existingApplicationIds.has(applicationId)
      );

      await organizations.relations.apps.insert(
        ...applicationIds.map((applicationId) => ({ organizationId: id, applicationId }))
      );

      ctx.status = 201;

      ctx.appendDataHookContext('Organization.Membership.Updated', {
        ...buildManagementApiContext(ctx),
        organizationId: id,
        ...truncateMembershipDelta({ addedApplicationIds: newApplicationIds }),
      });

      return next();
    }
  );

  router.put(
    '/:id/applications',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      body: z.object({ applicationIds: z.string().min(1).array() }),
      status: [204, 422],
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body: { applicationIds: rawApplicationIds },
      } = ctx.guard;

      const applicationIds = [...new Set(rawApplicationIds)];

      const { added, removed } = await organizations.relations.apps.replaceWithDelta(
        id,
        applicationIds
      );

      ctx.status = 204;

      ctx.appendDataHookContext('Organization.Membership.Updated', {
        ...buildManagementApiContext(ctx),
        organizationId: id,
        ...truncateMembershipDelta({
          addedApplicationIds: added,
          removedApplicationIds: removed,
        }),
      });

      return next();
    }
  );

  router.delete(
    '/:id/applications/:applicationId',
    koaGuard({
      params: z.object({ id: z.string().min(1), applicationId: z.string().min(1) }),
      status: [204, 422],
    }),
    async (ctx, next) => {
      const {
        params: { id, applicationId },
      } = ctx.guard;

      await organizations.relations.apps.delete({ organizationId: id, applicationId });

      ctx.status = 204;

      ctx.appendDataHookContext('Organization.Membership.Updated', {
        ...buildManagementApiContext(ctx),
        organizationId: id,
        ...truncateMembershipDelta({ removedApplicationIds: [applicationId] }),
      });

      return next();
    }
  );
};

/** Mounts the application-related routes on the organization router. */
export default function applicationRoutes(
  router: SchemaRouter<OrganizationKeys, CreateOrganization, Organization>,
  organizations: OrganizationQueries
) {
  router.get(
    '/:id/applications',
    koaPagination(),
    koaGuard({
      query: z.object({ q: z.string().optional() }),
      params: z.object({ id: z.string().min(1) }),
      response: applicationWithOrganizationRolesGuard.array(),
      status: [200, 404],
    }),
    async (ctx, next) => {
      const search = parseSearchOptions(applicationSearchKeys, ctx.guard.query);

      const [totalCount, entities] =
        await organizations.relations.apps.getApplicationsByOrganizationId(
          ctx.guard.params.id,
          ctx.pagination,
          search
        );

      ctx.pagination.totalCount = totalCount;
      ctx.body = entities;

      return next();
    }
  );

  mountMembershipRoutes(router, organizations);

  router.post(
    '/:id/applications/roles',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      body: z.object({
        applicationIds: z.string().min(1).array().nonempty(),
        organizationRoleIds: z.string().min(1).array().nonempty(),
      }),
      status: [201, 422],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      const { applicationIds, organizationRoleIds } = ctx.guard.body;

      await organizations.relations.appsRoles.insert(
        ...organizationRoleIds.flatMap((organizationRoleId) =>
          applicationIds.map((applicationId) => ({
            organizationId: id,
            applicationId,
            organizationRoleId,
          }))
        )
      );

      ctx.status = 201;
      return next();
    }
  );

  // MARK: Organization - application role relation routes
  applicationRoleRelationRoutes(router, organizations);
}
