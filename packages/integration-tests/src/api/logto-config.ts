import {
  SupportedSigningKeyAlgorithm,
  type AdminConsoleData,
  type OidcConfigKeysResponse,
  type LogtoOidcConfigKeyType,
  type LogtoJwtTokenKeyType,
  type JwtCustomizerAccessToken,
  type JwtCustomizerClientCredentials,
} from '@logto/schemas';

import { authedAdminApi } from './api.js';

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

export const deleteOidcKey = async (keyType: LogtoOidcConfigKeyType, id: string) =>
  authedAdminApi.delete(`configs/oidc/${keyType}/${id}`);

export const rotateOidcKeys = async (
  keyType: LogtoOidcConfigKeyType,
  signingKeyAlgorithm: SupportedSigningKeyAlgorithm = SupportedSigningKeyAlgorithm.EC
) =>
  authedAdminApi
    .post(`configs/oidc/${keyType}/rotate`, { json: { signingKeyAlgorithm } })
    .json<OidcConfigKeysResponse[]>();

export const insertOrUpdateJwtCustomizer = async (keyType: LogtoJwtTokenKeyType, value: unknown) =>
  authedAdminApi
    .put(`configs/jwt-customizer/${keyType}`, { json: value })
    .json<JwtCustomizerAccessToken | JwtCustomizerClientCredentials>();
