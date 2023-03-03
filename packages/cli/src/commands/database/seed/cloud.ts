import { adminConsoleApplicationId, adminTenantId, defaultTenantId } from '@logto/schemas';
import { appendPath, GlobalValues } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

import { log } from '../../../utils.js';

/**
 * Append Redirect URIs for the default tenant callback in cloud Admin Console.
 * It reads the same env variables as core to construct the cloud `UrlSet`.
 *
 * E.g., by default, it will appends `http://localhost:3003/default/callback` to the Redirect URIs.
 *
 * For why it is necessary, see the redirect lifecycle of cloud Admin Console.
 */
export const appendAdminConsoleRedirectUris = async (pool: CommonQueryMethods) => {
  const redirectUris = new GlobalValues().cloudUrlSet
    .deduplicated()
    .flatMap((endpoint) =>
      [defaultTenantId, adminTenantId].map((tenantId) => appendPath(endpoint, tenantId, 'callback'))
    );

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
