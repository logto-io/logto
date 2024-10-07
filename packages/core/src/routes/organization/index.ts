import { type OrganizationWithFeatured, Organizations, featuredUserGuard } from '@logto/schemas';
import { condArray, yes } from '@silverhand/essentials';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { koaQuotaGuard, koaReportSubscriptionUpdates } from '#src/middleware/koa-quota-guard.js';
import SchemaRouter from '#src/utils/SchemaRouter.js';
import { parseSearchOptions } from '#src/utils/search.js';

import organizationInvitationRoutes from '../organization-invitation/index.js';
import organizationRoleRoutes from '../organization-role/index.js';
import organizationScopeRoutes from '../organization-scope/index.js';
import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

import applicationRoutes from './application/index.js';
import jitRoutes from './jit/index.js';
import userRoutes from './user/index.js';
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
    middlewares: condArray(
      koaQuotaGuard({ key: 'organizationsLimit', quota, methods: ['POST', 'PUT'] }),
      koaReportSubscriptionUpdates({
        key: 'organizationsLimit',
        quota,
        methods: ['POST', 'PUT', 'DELETE'],
      })
    ),
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

  userRoutes(router, organizations);
  applicationRoutes(router, organizations);
  jitRoutes(router, organizations);

  // MARK: Mount sub-routes
  organizationRoleRoutes(...args);
  organizationScopeRoutes(...args);
  organizationInvitationRoutes(...args);

  // Add routes to the router
  originalRouter.use(router.routes());
}
