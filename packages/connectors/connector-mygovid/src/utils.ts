import { ConnectorError, ConnectorErrorCodes, parseJson } from '@logto/connector-kit';
import { requestTokenEndpoint } from '@logto/connector-oauth';
import { type KyResponse } from 'ky';

import type { AccessTokenResponse, OidcConnectorConfig } from './types.js';
import { accessTokenResponseGuard, authResponseGuard } from './types.js';

const accessTokenResponseHandler = async (response: KyResponse): Promise<AccessTokenResponse> => {
  const result = accessTokenResponseGuard.safeParse(parseJson(await response.text()));

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
  }

  return result.data;
};

export const getIdToken = async (
  config: OidcConnectorConfig,
  data: unknown,
  redirectUri: string
) => {
  const result = authResponseGuard.safeParse(data);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.General, data);
  }

  const { code } = result.data;

  const {
    tokenEndpoint,
    grantType,
    clientId,
    clientSecret,
    tokenEndpointAuthMethod,
    clientSecretJwtSigningAlgorithm,
    customConfig,
  } = config;

  const tokenResponse = await requestTokenEndpoint({
    tokenEndpoint,
    tokenEndpointAuthOptions: {
      method: tokenEndpointAuthMethod,
      clientSecretJwtSigningAlgorithm,
    },
    tokenRequestBody: {
      grantType,
      code,
      redirectUri,
      clientId,
      clientSecret,
      ...customConfig,
    },
  });

  return accessTokenResponseHandler(tokenResponse);
};
