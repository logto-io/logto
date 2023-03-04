import { CloudScope } from '@logto/schemas';
import { createRouter, RequestError } from '@withtyped/server';

import { tenantInfoGuard, TenantsLibrary } from '#src/libraries/tenants.js';
import type { WithAuthContext } from '#src/middleware/with-auth.js';
import { Queries } from '#src/queries/index.js';

const library = new TenantsLibrary(Queries.default);

export const tenants = createRouter<WithAuthContext, '/tenants'>('/tenants')
  .get('/', { response: tenantInfoGuard.array() }, async (context, next) => {
    return next({ ...context, json: await library.getAvailableTenants(context.auth.id) });
  })
  .post('/', { response: tenantInfoGuard }, async (context, next) => {
    if (
      ![CloudScope.CreateTenant, CloudScope.ManageTenant].some((scope) =>
        context.auth.scopes.includes(scope)
      )
    ) {
      throw new RequestError('Forbidden due to lack of permission.', 403);
    }

    const tenants = await library.getAvailableTenants(context.auth.id);

    if (!context.auth.scopes.includes(CloudScope.ManageTenant) && tenants.length > 0) {
      throw new RequestError('The user already has a tenant.', 409);
    }

    return next({ ...context, json: await library.createNewTenant(context.auth.id) });
  });
