import { Organizations } from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';

import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

export default function applicationUserConsentOrganizationRoutes<T extends ManagementApiRouter>(
  ...[
    router,
    {
      queries: { applications, users },
      libraries: {
        applications: {
          validateThirdPartyApplicationById,
          validateUserConsentOrganizationMembership,
        },
      },
    },
  ]: RouterInitArgs<T>
) {
  // Allow application level user consent organization management
  const params = Object.freeze({ id: z.string().min(1), userId: z.string().min(1) } as const);
  const pathname = '/applications/:id/users/:userId/consent-organizations';

  // Guard application exists and is a third party application
  router.use(pathname, koaGuard({ params: z.object(params) }), async (ctx, next) => {
    const { id, userId } = ctx.guard.params;

    await validateThirdPartyApplicationById(id);

    // Ensure that the user exists.
    await users.findUserById(userId);

    return next();
  });

  router.get(
    pathname,
    koaPagination(),
    koaGuard({
      params: z.object(params),
      response: z.object({
        organizations: Organizations.guard.array(),
      }),
      status: [200, 404, 422],
    }),
    async (ctx, next) => {
      const { id, userId } = ctx.guard.params;

      const [totalCount, entities] = await applications.userConsentOrganizations.getEntities(
        Organizations,
        {
          applicationId: id,
          userId,
        },
        ctx.pagination
      );

      ctx.pagination.totalCount = totalCount;
      ctx.body = { organizations: entities };

      return next();
    }
  );

  router.put(
    pathname,
    koaGuard({
      params: z.object(params),
      body: z.object({ organizationIds: z.string().min(1).array() }),
      status: [204, 404, 422],
    }),
    async (ctx, next) => {
      const { id, userId } = ctx.guard.params;
      const { organizationIds } = ctx.guard.body;

      // Assert that user is a member of all organizations
      await validateUserConsentOrganizationMembership(userId, organizationIds);

      await applications.userConsentOrganizations.replace(id, userId, organizationIds);

      ctx.status = 204;
      return next();
    }
  );

  router.post(
    pathname,
    koaGuard({
      params: z.object(params),
      body: z.object({ organizationIds: z.string().min(1).array().nonempty() }),
      status: [201, 404, 422],
    }),
    async (ctx, next) => {
      const { id, userId } = ctx.guard.params;
      const { organizationIds } = ctx.guard.body;

      // Assert that user is a member of all organizations
      await validateUserConsentOrganizationMembership(userId, organizationIds);

      await applications.userConsentOrganizations.insert(
        ...organizationIds.map<[string, string, string]>((organizationId) => [
          id,
          userId,
          organizationId,
        ])
      );

      ctx.status = 201;
      return next();
    }
  );

  router.delete(
    `${pathname}/:organizationId`,
    koaGuard({
      params: z.object({
        ...params,
        organizationId: z.string().min(1),
      }),
      status: [204, 404, 422],
    }),
    async (ctx, next) => {
      const { id, organizationId, userId } = ctx.guard.params;

      await applications.userConsentOrganizations.delete({
        applicationId: id,
        organizationId,
        userId,
      });

      ctx.status = 204;
      return next();
    }
  );
}
