import { OrganizationScopes } from '@logto/schemas';
import { condArray } from '@silverhand/essentials';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { koaQuotaGuard, koaReportSubscriptionUpdates } from '#src/middleware/koa-quota-guard.js';
import SchemaRouter from '#src/utils/SchemaRouter.js';
import { parseSearchOptions } from '#src/utils/search.js';

import { errorHandler } from '../organization/utils.js';
import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

export default function organizationScopeRoutes<T extends ManagementApiRouter>(
  ...[
    originalRouter,
    {
      queries: {
        organizations: { scopes },
      },
      libraries: { quota },
    },
  ]: RouterInitArgs<T>
) {
  const router = new SchemaRouter(OrganizationScopes, scopes, {
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
  });

  router.get(
    '/',
    koaPagination({ isOptional: true }),
    koaGuard({
      query: z.object({ q: z.string().optional() }),
      response: OrganizationScopes.guard.array(),
      status: [200],
    }),
    async (ctx, next) => {
      const { limit, offset, disabled: isPaginationDisabled } = ctx.pagination;
      const search = parseSearchOptions(['name'], ctx.guard.query);

      if (isPaginationDisabled) {
        const [_, entities] = await scopes.findAll();

        ctx.body = entities;

        return next();
      }

      const [count, entities] = await scopes.findAll(limit, offset, search);

      ctx.pagination.totalCount = count;
      ctx.body = entities;

      return next();
    }
  );

  originalRouter.use(router.routes());
}
