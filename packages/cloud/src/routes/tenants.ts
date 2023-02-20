import { Router } from '@withtyped/server';
import { z } from 'zod';

import { client } from '#src/queries/index.js';
import { createTenantsQueries } from '#src/queries/tenants.js';
import { getTenantIdFromManagementApiIndicator } from '#src/utils/tenant.js';

const { getManagementApiLikeIndicatorsForUser } = createTenantsQueries(client);

export const tenants = new Router('/tenants').get(
  '/',
  { response: z.object({ id: z.string(), indicator: z.string() }).array() },
  async (context, next) => {
    const { rows } = await getManagementApiLikeIndicatorsForUser('some_user_id');

    const tenants = rows
      .map(({ indicator }) => ({
        id: getTenantIdFromManagementApiIndicator(indicator),
        indicator,
      }))
      .filter((tenant): tenant is { id: string; indicator: string } => Boolean(tenant.id));

    return next({ ...context, json: tenants });
  }
);
