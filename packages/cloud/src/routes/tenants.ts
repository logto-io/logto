import { createRouter } from '@withtyped/server';
import { z } from 'zod';

import type { WithAuthContext } from '#src/middleware/with-auth.js';
import { client } from '#src/queries/index.js';
import { createTenantsQueries } from '#src/queries/tenants.js';
import { getTenantIdFromManagementApiIndicator } from '#src/utils/tenant.js';

const { getManagementApiLikeIndicatorsForUser } = createTenantsQueries(client);

export const tenants = createRouter<WithAuthContext, '/tenants'>('/tenants').get(
  '/',
  { response: z.object({ id: z.string(), indicator: z.string() }).array() },
  async (context, next) => {
    const { rows } = await getManagementApiLikeIndicatorsForUser(context.auth.id);

    const tenants = rows
      .map(({ indicator }) => ({
        id: getTenantIdFromManagementApiIndicator(indicator),
        indicator,
      }))
      .filter((tenant): tenant is { id: string; indicator: string } => Boolean(tenant.id));

    return next({ ...context, json: tenants });
  }
);
