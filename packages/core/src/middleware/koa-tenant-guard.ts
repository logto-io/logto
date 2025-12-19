import type { Middleware } from 'koa';
import { type IRouterParamContext } from 'koa-router';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';

export default function koaTenantGuard<StateT, ContextT extends IRouterParamContext, BodyT>(
  tenantId: string,
  { tenants }: Queries
): Middleware<StateT, ContextT, BodyT> {
  return async (ctx, next) => {
    const { isCloud } = EnvSet.values;

    if (!isCloud) {
      return next();
    }

    const { isSuspended } = await tenants.findTenantMetadataById(tenantId);

    if (isSuspended) {
      throw new RequestError('subscription.tenant_suspended', 403);
    }

    await next();
  };
}
