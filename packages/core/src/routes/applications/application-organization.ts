import { organizationWithOrganizationRolesGuard } from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';

import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

export default function applicationOrganizationRoutes<T extends ManagementApiRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  router.get(
    '/applications/:id/organizations',
    koaPagination({ isOptional: true }),
    koaGuard({
      params: z.object({ id: z.string() }),
      response: organizationWithOrganizationRolesGuard.array(),
      status: [200, 404],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;

      // Ensure that the user exists.
      await queries.applications.findApplicationById(id);

      const [count, entities] =
        await queries.organizations.relations.apps.getOrganizationsByApplicationId(
          id,
          ctx.pagination.disabled ? undefined : ctx.pagination
        );

      if (!ctx.pagination.disabled) {
        ctx.pagination.totalCount = count;
      }
      ctx.body = entities;

      return next();
    }
  );
}
