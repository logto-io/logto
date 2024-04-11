import crypto from 'node:crypto';

import type { LogtoConfig } from '@logto/schemas';
import {
  logtoOidcConfigGuard,
  adminTenantId,
  LogtoOidcConfigKey,
  LogtoConfigs,
} from '@logto/schemas';
import { appendPath } from '@silverhand/essentials';
import { sql } from '@silverhand/slonik';
import type { JWK } from 'jose';

import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';
import { exportJWK } from '#src/utils/jwks.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(LogtoConfigs);

/**
 * This function is to fetch OIDC public signing keys and the issuer from the admin tenant
 * in order to let user tenants recognize Access Tokens issued by the admin tenant.
 *
 * Usually you don't mean to call this function.
 */
export const getAdminTenantTokenValidationSet = async (): Promise<{
  keys: JWK[];
  issuer: string[];
}> => {
  const { isMultiTenancy, adminUrlSet } = EnvSet.values;

  if (!isMultiTenancy && adminUrlSet.deduplicated().length === 0) {
    return { keys: [], issuer: [] };
  }

  const pool = await EnvSet.sharedPool;
  const { value } = await pool.one<LogtoConfig>(sql`
    select ${sql.join([fields.key, fields.value], sql`,`)} from ${table}
      where ${fields.tenantId} = ${adminTenantId}
      and ${fields.key} = ${LogtoOidcConfigKey.PrivateKeys}
  `);
  const privateKeys = logtoOidcConfigGuard['oidc.privateKeys']
    .parse(value)
    .map(({ value }) => crypto.createPrivateKey(value));
  const publicKeys = privateKeys.map((key) => crypto.createPublicKey(key));

  return {
    keys: await Promise.all(publicKeys.map(async (key) => exportJWK(key))),
    issuer: [
      appendPath(
        isMultiTenancy ? getTenantEndpoint(adminTenantId, EnvSet.values) : adminUrlSet.endpoint,
        '/oidc'
      ).href,
    ],
  };
};
