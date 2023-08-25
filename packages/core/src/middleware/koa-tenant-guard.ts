import type { Middleware } from 'koa';
import { type IRouterParamContext } from 'koa-router';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type CloudConnectionLibrary } from '#src/libraries/cloud-connection.js';

const getAvailableTenant = async (cloudConnection: CloudConnectionLibrary) => {
  const client = await cloudConnection.getClient();
  const tenant = await client.get('/api/my/tenant');

  return tenant;
};

export default function koaTenantGuard<StateT, ContextT extends IRouterParamContext, BodyT>(
  cloudConnection: CloudConnectionLibrary
): Middleware<StateT, ContextT, BodyT> {
  return async (ctx, next) => {
    const { isCloud } = EnvSet.values;

    if (!isCloud) {
      return next();
    }

    const tenant = await getAvailableTenant(cloudConnection);

    if (tenant.isSuspended) {
      throw new RequestError('subscription.tenant_suspended', 403);
    }

    await next();
  };
}
