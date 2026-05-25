import crypto from 'node:crypto';
import { type IncomingHttpHeaders } from 'node:http';

import {
  LogtoConfigs,
  LogtoOidcConfigKey,
  adminTenantId,
  getOidcProviderPrivateKeys,
  logtoOidcConfigGuard,
  type LogtoConfig,
} from '@logto/schemas';
import { TtlCache } from '@logto/shared';
import { appendPath, isKeyInObject } from '@silverhand/essentials';
import { sql } from '@silverhand/slonik';
import { type JWK } from 'jose';
import ky from 'ky';

import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';
import { exportJWK } from '#src/utils/jwks.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

import RequestError from '../../errors/RequestError/index.js';
import assertThat from '../../utils/assert-that.js';

const { table, fields } = convertToIdentifiers(LogtoConfigs);

const jwksCache = new TtlCache<string, JWK[]>(60 * 60 * 1000); // 1 hour

/**
 * Read admin tenant public JWKs directly from `logto_configs` for single-tenant
 * deployments (OSS). Avoids the self-HTTP round-trip to `/.well-known/openid-configuration`,
 * which breaks behind reverse proxies that don't resolve the admin endpoint from inside
 * the container (see https://github.com/logto-io/logto/issues/6048).
 *
 * Returns all canonical keys (Current + Next + Previous) so verification stays consistent
 * with what the admin tenant's `/jwks` endpoint exposes during rotation.
 */
const getAdminTenantPublicJwksFromDatabase = async (): Promise<JWK[]> => {
  const pool = await EnvSet.sharedPool;
  const { value } = await pool.one<LogtoConfig>(sql`
    select ${sql.join([fields.key, fields.value], sql`,`)} from ${table}
      where ${fields.tenantId} = ${adminTenantId}
      and ${fields.key} = ${LogtoOidcConfigKey.PrivateKeys}
  `);
  const privateKeys = getOidcProviderPrivateKeys(
    logtoOidcConfigGuard[LogtoOidcConfigKey.PrivateKeys].parse(value)
  ).map(({ value }) => crypto.createPrivateKey(value));
  const publicKeys = privateKeys.map((key) => crypto.createPublicKey(key));

  return Promise.all(publicKeys.map(async (key) => exportJWK(key)));
};

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

  const issuer = appendPath(
    isMultiTenancy ? getTenantEndpoint(adminTenantId, EnvSet.values) : adminUrlSet.endpoint,
    '/oidc'
  );

  // In single-tenant deployments (OSS), the admin tenant lives in the same database
  // cluster, so we can read its public JWKs directly and skip the self-HTTP request
  // that the multi-tenant path needs.
  if (!isMultiTenancy) {
    return {
      keys: await getAdminTenantPublicJwksFromDatabase(),
      issuer: [issuer.href],
    };
  }

  const cached = jwksCache.get(issuer.href);

  if (cached) {
    return {
      keys: cached,
      issuer: [issuer.href],
    };
  }

  const configuration = await ky
    .get(appendPath(issuer, '/.well-known/openid-configuration'))
    .json();

  if (!isKeyInObject(configuration, 'jwks_uri')) {
    return { keys: [], issuer: [] };
  }

  const jwks = await ky.get(String(configuration.jwks_uri)).json<{ keys: JWK[] }>();

  if (!isKeyInObject(jwks, 'keys') || !Array.isArray(jwks.keys)) {
    return { keys: [], issuer: [] };
  }

  jwksCache.set(issuer.href, jwks.keys);

  return {
    keys: jwks.keys,
    issuer: [issuer.href],
  };
};

const bearerTokenIdentifier = 'Bearer';

export const extractBearerTokenFromHeaders = ({ authorization }: IncomingHttpHeaders) => {
  assertThat(
    authorization,
    new RequestError({ code: 'auth.authorization_header_missing', status: 401 })
  );
  assertThat(
    authorization.startsWith(bearerTokenIdentifier),
    new RequestError(
      { code: 'auth.authorization_token_type_not_supported', status: 401 },
      { supportedTypes: [bearerTokenIdentifier] }
    )
  );

  return authorization.slice(bearerTokenIdentifier.length + 1);
};
