import { type IncomingHttpHeaders } from 'node:http';

import { adminTenantId } from '@logto/schemas';
import { TtlCache } from '@logto/shared';
import { appendPath, isKeyInObject } from '@silverhand/essentials';
import { type JWK } from 'jose';
import ky from 'ky';

import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';
import { getOidcProviderPublicJwks } from '#src/libraries/oidc-private-key.js';
import { getAdminTenantPrivateSigningKeys } from '#src/tenants/utils.js';

import RequestError from '../../errors/RequestError/index.js';
import assertThat from '../../utils/assert-that.js';

const jwksCache = new TtlCache<string, JWK[]>(60 * 60 * 1000); // 1 hour

const getAdminTenantIssuer = () =>
  appendPath(
    EnvSet.values.isMultiTenancy
      ? getTenantEndpoint(adminTenantId, EnvSet.values)
      : EnvSet.values.adminUrlSet.endpoint,
    '/oidc'
  );

const getCloudAdminTenantTokenValidationSet = async (
  issuer: URL
): Promise<{ keys: JWK[]; issuer: string[] }> => {
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

const getOssAdminTenantTokenValidationSet = async (
  issuer: URL
): Promise<{ keys: JWK[]; issuer: string[] }> => {
  const cached = jwksCache.get(issuer.href);

  if (cached) {
    return {
      keys: cached,
      issuer: [issuer.href],
    };
  }

  const privateKeys = await getAdminTenantPrivateSigningKeys();

  if (privateKeys.length === 0) {
    jwksCache.set(issuer.href, []);

    return {
      keys: [],
      issuer: [issuer.href],
    };
  }

  const keys = await getOidcProviderPublicJwks(privateKeys);

  jwksCache.set(issuer.href, keys);

  return {
    keys,
    issuer: [issuer.href],
  };
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

  const issuer = getAdminTenantIssuer();

  if (EnvSet.values.isCloud) {
    return getCloudAdminTenantTokenValidationSet(issuer);
  }

  return getOssAdminTenantTokenValidationSet(issuer);
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
