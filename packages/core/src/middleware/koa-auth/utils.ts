import { type IncomingHttpHeaders } from 'node:http';

import { adminTenantId } from '@logto/schemas';
import { TtlCache } from '@logto/shared';
import { appendPath, isKeyInObject } from '@silverhand/essentials';
import { type JWK } from 'jose';
import ky from 'ky';

import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';

import RequestError from '../../errors/RequestError/index.js';
import assertThat from '../../utils/assert-that.js';

const jwksCache = new TtlCache<string, JWK[]>(60 * 60 * 1000); // 1 hour

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
