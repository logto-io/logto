import { generateStandardId, buildIdGenerator } from '@logto/core-kit';
import {
  defaultManagementApi,
  Applications,
  demoAppApplicationId,
  buildDemoAppDataForTenant,
} from '@logto/schemas';
import { boolean, object, string, z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { buildOidcClientMetadata } from '#src/oidc/utils.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

const applicationId = buildIdGenerator(21);

export default function applicationRoutes<T extends AuthedRouter>(
  ...[router, { queries, id: tenantId }]: RouterInitArgs<T>
) {
  const {
    deleteApplicationById,
    findApplicationById,
    findAllApplications,
    insertApplication,
    updateApplicationById,
    findTotalNumberOfApplications,
  } = queries.applications;
  const { findApplicationsRolesByApplicationId, insertApplicationsRoles, deleteApplicationRole } =
    queries.applicationsRoles;

  router.get('/applications', koaPagination(), async (ctx, next) => {
    const { limit, offset } = ctx.pagination;

    const [{ count }, applications] = await Promise.all([
      findTotalNumberOfApplications(),
      findAllApplications(limit, offset),
    ]);

    // Return totalCount to pagination middleware
    ctx.pagination.totalCount = count;
    ctx.body = applications;

    return next();
  });

  router.post(
    '/applications',
    koaGuard({
      body: Applications.createGuard
        .omit({ id: true, createdAt: true })
        .partial()
        .merge(Applications.createGuard.pick({ name: true, type: true })),
    }),
    async (ctx, next) => {
      const { oidcClientMetadata, ...rest } = ctx.guard.body;

      ctx.body = await insertApplication({
        id: applicationId(),
        secret: generateStandardId(),
        oidcClientMetadata: buildOidcClientMetadata(oidcClientMetadata),
        ...rest,
      });

      return next();
    }
  );

  router.get(
    '/applications/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      response: Applications.guard.merge(z.object({ isAdmin: z.boolean() })),
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      // Somethings console needs to display demo app info. Build a fixed one for it.
      if (id === demoAppApplicationId) {
        ctx.body = { ...buildDemoAppDataForTenant(tenantId), isAdmin: false };

        return next();
      }

      const application = await findApplicationById(id);
      const applicationsRoles = await findApplicationsRolesByApplicationId(id);

      ctx.body = {
        ...application,
        isAdmin: applicationsRoles.some(({ roleId }) => roleId === defaultManagementApi.role.id),
      };

      return next();
    }
  );

  router.patch(
    '/applications/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: Applications.createGuard
        .omit({ id: true, createdAt: true })
        .deepPartial()
        .merge(
          object({
            isAdmin: boolean().optional(),
          })
        ),
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;

      const { isAdmin, ...rest } = body;

      // FIXME @sijie temp solution to set admin access to machine to machine app
      if (isAdmin !== undefined) {
        const applicationsRoles = await findApplicationsRolesByApplicationId(id);
        const originalIsAdmin = applicationsRoles.some(
          ({ roleId }) => roleId === defaultManagementApi.role.id
        );

        if (isAdmin && !originalIsAdmin) {
          await insertApplicationsRoles([
            { id: generateStandardId(), applicationId: id, roleId: defaultManagementApi.role.id },
          ]);
        } else if (!isAdmin && originalIsAdmin) {
          await deleteApplicationRole(id, defaultManagementApi.role.id);
        }
      }

      ctx.body = await updateApplicationById(id, rest);

      return next();
    }
  );

  router.delete(
    '/applications/:id',
    koaGuard({ params: object({ id: string().min(1) }) }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      // Note: will need delete cascade when application is joint with other tables
      await deleteApplicationById(id);
      ctx.status = 204;

      return next();
    }
  );
}
