import { assert, pick } from '@silverhand/essentials';
import type { Response } from 'got';
import { got, HTTPError } from 'got';
import snakecaseKeys from 'snakecase-keys';

import { ConnectorError, ConnectorErrorCodes, parseJson } from '@logto/connector-kit';
import qs from 'query-string';

import { defaultTimeout } from './constant.js';
import type {
  OauthConfig,
  TokenEndpointResponseType,
  AccessTokenResponse,
  ProfileMap,
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
      throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(error.response.body));
    }
    throw error;
  }
};

const accessTokenResponseHandler = async (
  response: Response<string>,
  tokenEndpointResponseType: TokenEndpointResponseType
): Promise<AccessTokenResponse> => {
  const result = accessTokenResponseGuard.safeParse(
    tokenEndpointResponseType === 'json' ? parseJson(response.body) : qs.parse(response.body)
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
  const keyMap = new Map(
    Object.entries(keyMapping).map(([destination, source]) => [source, destination])
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const mappedUserProfile = Object.fromEntries(
    Object.entries(originUserProfile)
      .filter(([key, value]) => keyMap.get(key) && value)
      .map(([key, value]) => [keyMap.get(key), value])
  );

  const result = userProfileGuard.safeParse(mappedUserProfile);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
  }

  return result.data;
};

export const getAccessToken = async (config: OauthConfig, data: unknown, redirectUri: string) => {
  const result = authResponseGuard.safeParse(data);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.General, data);
  }

  const { code } = result.data;

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
