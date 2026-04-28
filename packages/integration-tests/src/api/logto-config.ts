import {
  SupportedSigningKeyAlgorithm,
  type AdminConsoleData,
  type OidcConfigKeysResponse,
  type LogtoOidcConfigKeyType,
  type AccessTokenJwtCustomizer,
  type ClientCredentialsJwtCustomizer,
  type JwtCustomizerConfigs,
  type JwtCustomizerTestRequestBody,
  type Json,
  type IdTokenConfig,
  type OidcSessionConfig,
} from '@logto/schemas';

import { waitFor } from '#src/utils.js';

import { authedAdminApi } from './api.js';

// OIDC config mutation APIs invalidate tenant cache asynchronously. These integration helpers wait
// before returning so follow-up test requests do not race the cache refresh while the production API
// behavior stays non-blocking.
const tenantCacheInvalidationDelay = 2000;

const waitForTenantCacheInvalidation = async () => {
  await waitFor(tenantCacheInvalidationDelay);
};

export const getAdminConsoleConfig = async () =>
  authedAdminApi.get('configs/admin-console').json<AdminConsoleData>();

export const updateAdminConsoleConfig = async (payload: Partial<AdminConsoleData>) =>
  authedAdminApi
    .patch(`configs/admin-console`, {
      json: payload,
    })
    .json<AdminConsoleData>();

export const getOidcKeys = async (keyType: LogtoOidcConfigKeyType) =>
  authedAdminApi.get(`configs/oidc/${keyType}`).json<OidcConfigKeysResponse[]>();

export const deleteOidcKey = async (keyType: LogtoOidcConfigKeyType, id: string) => {
  const response = await authedAdminApi.delete(`configs/oidc/${keyType}/${id}`);
  await waitForTenantCacheInvalidation();
  return response;
};

export const rotateOidcKeys = async (
  keyType: LogtoOidcConfigKeyType,
  signingKeyAlgorithm: SupportedSigningKeyAlgorithm = SupportedSigningKeyAlgorithm.EC,
  rotationGracePeriod?: number
) => {
  const oidcKeys = await authedAdminApi
    .post(`configs/oidc/${keyType}/rotate`, {
      json: {
        signingKeyAlgorithm,
        rotationGracePeriod,
      },
    })
    .json<OidcConfigKeysResponse[]>();
  await waitForTenantCacheInvalidation();
  return oidcKeys;
};

export const upsertJwtCustomizer = async (
  keyTypePath: 'access-token' | 'client-credentials',
  value: unknown
) =>
  authedAdminApi
    .put(`configs/jwt-customizer/${keyTypePath}`, { json: value })
    .json<AccessTokenJwtCustomizer | ClientCredentialsJwtCustomizer>();

export const getJwtCustomizer = async (keyTypePath: 'access-token' | 'client-credentials') =>
  authedAdminApi
    .get(`configs/jwt-customizer/${keyTypePath}`)
    .json<AccessTokenJwtCustomizer | ClientCredentialsJwtCustomizer>();

export const getJwtCustomizers = async () =>
  authedAdminApi.get(`configs/jwt-customizer`).json<JwtCustomizerConfigs[]>();

export const deleteJwtCustomizer = async (keyTypePath: 'access-token' | 'client-credentials') =>
  authedAdminApi.delete(`configs/jwt-customizer/${keyTypePath}`);

export const updateJwtCustomizer = async (
  keyTypePath: 'access-token' | 'client-credentials',
  value: unknown
) =>
  authedAdminApi
    .patch(`configs/jwt-customizer/${keyTypePath}`, { json: value })
    .json<AccessTokenJwtCustomizer | ClientCredentialsJwtCustomizer>();

export const testJwtCustomizer = async (payload: JwtCustomizerTestRequestBody) =>
  authedAdminApi
    .post(`configs/jwt-customizer/test`, {
      json: payload,
    })
    .json<Json>();

export const getIdTokenConfig = async () =>
  authedAdminApi.get('configs/id-token').json<IdTokenConfig>();

export const upsertIdTokenConfig = async (payload: IdTokenConfig) =>
  authedAdminApi.put('configs/id-token', { json: payload }).json<IdTokenConfig>();

export const getSessionConfig = async () =>
  authedAdminApi.get('configs/oidc/session').json<
    OidcSessionConfig & {
      ttl: number;
    }
  >();

export const updateSessionConfig = async (payload: Partial<OidcSessionConfig>) => {
  const sessionConfig = await authedAdminApi
    .patch('configs/oidc/session', { json: payload })
    .json<OidcSessionConfig & { ttl: number }>();
  await waitForTenantCacheInvalidation();
  return sessionConfig;
};
