import { assert, getSafe } from '@silverhand/essentials';

import { ConnectorError, ConnectorErrorCodes, parseJson } from '@logto/connector-kit';
import { type KyResponse } from 'ky';
import qs from 'query-string';

import {
  type Oauth2AccessTokenResponse,
  oauth2AccessTokenResponseGuard,
  oauth2AuthResponseGuard,
} from './oauth2/types.js';
import { requestTokenEndpoint } from './oauth2/utils.js';
import type { Oauth2ConnectorConfig, TokenEndpointResponseType, ProfileMap } from './types.js';
import { userProfileGuard } from './types.js';

const accessTokenResponseHandler = async (
  response: KyResponse,
  tokenEndpointResponseType: TokenEndpointResponseType
): Promise<Oauth2AccessTokenResponse> => {
  const responseContent = await response.text();
  const result = oauth2AccessTokenResponseGuard.safeParse(
    tokenEndpointResponseType === 'json' ? parseJson(responseContent) : qs.parse(responseContent)
  ); // Why it works with qs.parse()

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
  }

  assert(
    result.data.access_token,
    new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, {
      message: 'Can not find `access_token` in token response!',
    })
  );

  return result.data;
};

export const userProfileMapping = (
  // eslint-disable-next-line @typescript-eslint/ban-types
  originUserProfile: object,
  keyMapping: ProfileMap
) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const mappedUserProfile = Object.fromEntries(
    Object.entries(keyMapping)
      .map(([destination, source]) => [destination, getSafe(originUserProfile, source)])
      .filter(([_, value]) => value)
  );

  const result = userProfileGuard.safeParse(mappedUserProfile);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
  }

  return result.data;
};

export const getAccessToken = async (
  config: Oauth2ConnectorConfig,
  data: unknown,
  redirectUri: string
) => {
  const result = oauth2AuthResponseGuard.safeParse(data);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.General, data);
  }

  const { code } = result.data;

  const {
    grantType,
    tokenEndpoint,
    tokenEndpointResponseType,
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

  return accessTokenResponseHandler(tokenResponse, tokenEndpointResponseType);
};

export const getAccessTokenByRefreshToken = async (
  config: Oauth2ConnectorConfig,
  refreshToken: string
): Promise<Oauth2AccessTokenResponse> => {
  const {
    tokenEndpoint,
    tokenEndpointResponseType,
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
      grantType: 'refresh_token',
      refreshToken,
      clientId,
      clientSecret,
      ...customConfig,
    },
  });

  return accessTokenResponseHandler(tokenResponse, tokenEndpointResponseType);
};
