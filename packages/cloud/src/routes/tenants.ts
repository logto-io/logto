import { createRouter, RequestError } from '@withtyped/server';

import { createTenantsLibrary, tenantInfoGuard } from '#src/libraries/tenants.js';
import type { WithAuthContext } from '#src/middleware/with-auth.js';
import { Queries } from '#src/queries/index.js';

const { getAvailableTenants, createNewTenant } = createTenantsLibrary(Queries.default);

export const tenants = createRouter<WithAuthContext, '/tenants'>('/tenants')
  .get('/', { response: tenantInfoGuard.array() }, async (context, next) => {
    return next({ ...context, json: await getAvailableTenants(context.auth.id) });
  })
  .post('/', { response: tenantInfoGuard }, async (context, next) => {
    const tenants = await getAvailableTenants(context.auth.id);

    if (tenants.length > 0) {
      throw new RequestError('The user already has a tenant.', 409);
    }

    return next({ ...context, json: await createNewTenant(context.auth.id) });
  });
