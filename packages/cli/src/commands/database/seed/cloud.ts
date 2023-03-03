import { adminConsoleApplicationId, adminTenantId, defaultTenantId } from '@logto/schemas';
import { appendPath, GlobalValues } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

import { log } from '../../../utils.js';

export const appendAdminConsoleRedirectUris = async (pool: CommonQueryMethods) => {
  const redirectUris = new GlobalValues().cloudUrlSet
    .deduplicated()
    .map((endpoint) => appendPath(endpoint, defaultTenantId, 'callback'));

  const metadataKey = sql.identifier(['oidc_client_metadata']);

  // Copied from packages/cloud/src/queries/tenants.ts
  // Can be merged into the original once we remove slonik
  await pool.query(sql`
    update applications
    set ${metadataKey} = jsonb_set(
      ${metadataKey},
      '{redirectUris}',
      (select jsonb_agg(distinct value) from jsonb_array_elements(
        ${metadataKey}->'redirectUris' || ${sql.jsonb(redirectUris.map(String))}
      ))
    )
    where id = ${adminConsoleApplicationId}
    and tenant_id = ${adminTenantId}
  `);

  log.succeed('Appended initial Redirect URIs to Admin Console:', redirectUris.map(String));
};
