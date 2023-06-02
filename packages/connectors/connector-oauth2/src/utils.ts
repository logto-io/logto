import { pick } from '@silverhand/essentials';
import type { Response } from 'got';
import { got, HTTPError } from 'got';
import snakecaseKeys from 'snakecase-keys';
import { type z } from 'zod';

import {
  ConnectorError,
  ConnectorErrorCodes,
  parseJson,
  connectorDataParser,
} from '@logto/connector-kit';
import qs from 'query-string';

import { defaultTimeout } from './constant.js';
import type {
  OauthConfig,
  TokenEndpointResponseType,
  AccessTokenResponse,
  ProfileMap,
  UserProfile,
  AuthResponse,
} from './types.js';
import { authResponseGuard, accessTokenResponseGuard, userProfileGuard } from './types.js';

export const accessTokenRequester = async (
  tokenEndpoint: string,
  queryParameters: Record<string, string>,
  tokenEndpointResponseType: TokenEndpointResponseType,
  timeout: number = defaultTimeout
): Promise<AccessTokenResponse> => {
  try {
    const httpResponse = await got.post({
      url: tokenEndpoint,
      form: queryParameters,
      timeout: { request: timeout },
    });

    return await accessTokenResponseHandler(httpResponse, tokenEndpointResponseType);
  } catch (error: unknown) {
    if (error instanceof HTTPError) {
      throw new ConnectorError(ConnectorErrorCodes.General, { data: error.response.body });
    }
    throw error;
  }
};

const accessTokenResponseHandler = async (
  response: Response<string>,
  tokenEndpointResponseType: TokenEndpointResponseType
): Promise<AccessTokenResponse> => {
  /**
   * Why it works with qs.parse()?
   * Some social vendor (like GitHub) does not strictly follow the OAuth2 protocol.
   */
  const parsedBody =
    tokenEndpointResponseType === 'json' ? parseJson(response.body) : qs.parse(response.body);
  return connectorDataParser<AccessTokenResponse>(parsedBody, accessTokenResponseGuard);
};

export const userProfileMapping = (
  // eslint-disable-next-line @typescript-eslint/ban-types
  originUserProfile: object,
  keyMapping: ProfileMap
) => {
  const keyMap = new Map(
    Object.entries(keyMapping).map(([destination, source]) => [source, destination])
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const mappedUserProfile = Object.fromEntries(
    Object.entries(originUserProfile)
      .filter(([key, value]) => keyMap.get(key) && value)
      .map(([key, value]) => [keyMap.get(key), value])
  );
  return connectorDataParser<UserProfile, z.input<typeof userProfileGuard>>(
    mappedUserProfile,
    userProfileGuard
  );
};

export const getAccessToken = async (config: OauthConfig, data: unknown, redirectUri: string) => {
  const { code } = connectorDataParser<AuthResponse>(data, authResponseGuard);

  const { customConfig, ...rest } = config;

  const parameterObject = snakecaseKeys({
    ...pick(rest, 'grantType', 'clientId', 'clientSecret'),
    ...customConfig,
    code,
    redirectUri,
  });

  return accessTokenRequester(
    config.tokenEndpoint,
    parameterObject,
    config.tokenEndpointResponseType
  );
};
