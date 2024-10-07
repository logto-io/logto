import { OrganizationScopes } from '@logto/schemas';
import { condArray } from '@silverhand/essentials';

import { koaQuotaGuard, koaReportSubscriptionUpdates } from '#src/middleware/koa-quota-guard.js';
import SchemaRouter from '#src/utils/SchemaRouter.js';

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

  originalRouter.use(router.routes());
}
