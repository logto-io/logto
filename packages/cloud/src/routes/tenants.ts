import { CloudScope, tenantInfoGuard, createTenantGuard } from '@logto/schemas';
import { createRouter, RequestError } from '@withtyped/server';

import type { TenantsLibrary } from '#src/libraries/tenants.js';
import type { WithAuthContext } from '#src/middleware/with-auth.js';

export const tenantsRoutes = (library: TenantsLibrary) =>
  createRouter<WithAuthContext, '/tenants'>('/tenants')
    .get('/', { response: tenantInfoGuard.array() }, async (context, next) => {
      return next({
        ...context,
        json: await library.getAvailableTenants(context.auth.id),
        status: 200,
      });
    })
    .post(
      '/',
      {
        body: createTenantGuard.pick({ name: true, tag: true }).required(),
        response: tenantInfoGuard,
      },
      async (context, next) => {
        if (
          ![CloudScope.CreateTenant, CloudScope.ManageTenant].some((scope) =>
            context.auth.scopes.includes(scope)
          )
        ) {
          throw new RequestError('Forbidden due to lack of permission.', 403);
        }

        return next({
          ...context,
          json: await library.createNewTenant(context.auth.id, context.guarded.body),
          status: 201,
        });
      }
    );
