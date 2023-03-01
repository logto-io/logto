import crypto from 'crypto';

import type { LogtoConfig } from '@logto/schemas';
import {
  logtoOidcConfigGuard,
  adminTenantId,
  LogtoOidcConfigKey,
  LogtoConfigs,
} from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import type { JWK } from 'jose';
import { sql } from 'slonik';

import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';
import { exportJWK } from '#src/utils/jwks.js';
import { appendPath } from '#src/utils/url.js';

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
  const { isDomainBasedMultiTenancy, adminUrlSet } = EnvSet.values;

  if (!isDomainBasedMultiTenancy && adminUrlSet.deduplicated().length === 0) {
    return { keys: [], issuer: [] };
  }

  const pool = await EnvSet.pool;
  const { value } = await pool.one<LogtoConfig>(sql`
    select ${sql.join([fields.key, fields.value], sql`,`)} from ${table}
      where ${fields.tenantId} = ${adminTenantId}
      and ${fields.key} = ${LogtoOidcConfigKey.PrivateKeys}
  `);
  const privateKeys = logtoOidcConfigGuard['oidc.privateKeys']
    .parse(value)
    .map((key) => crypto.createPrivateKey(key));
  const publicKeys = privateKeys.map((key) => crypto.createPublicKey(key));

  return {
    keys: await Promise.all(publicKeys.map(async (key) => exportJWK(key))),
    issuer: [
      appendPath(
        isDomainBasedMultiTenancy
          ? getTenantEndpoint(adminTenantId, EnvSet.values)
          : adminUrlSet.endpoint,
        '/oidc'
      ).toString(),
    ],
  };
};
