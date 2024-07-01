import {
  type OrganizationKeys,
  type CreateOrganization,
  type Organization,
  applicationWithOrganizationRolesGuard,
} from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { applicationSearchKeys } from '#src/queries/application.js';
import type OrganizationQueries from '#src/queries/organization/index.js';
import type SchemaRouter from '#src/utils/SchemaRouter.js';
import { parseSearchOptions } from '#src/utils/search.js';

import applicationRoleRelationRoutes from './role-relations.js';

/** Mounts the application-related routes on the organization router. */
export default function applicationRoutes(
  router: SchemaRouter<OrganizationKeys, CreateOrganization, Organization>,
  organizations: OrganizationQueries
) {
  // MARK: Organization - application relation routes
  router.addRelationRoutes(organizations.relations.apps, undefined, {
    disabled: { get: true },
    hookEvent: 'Organization.Membership.Updated',
  });

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
