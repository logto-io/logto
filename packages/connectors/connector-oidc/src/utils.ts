import { assert, pick } from '@silverhand/essentials';
import type { Response } from 'got';
import { got, HTTPError } from 'got';
import snakecaseKeys from 'snakecase-keys';

import {
  ConnectorError,
  ConnectorErrorCodes,
  parseJson,
  connectorDataParser,
} from '@logto/connector-kit';

import { defaultTimeout } from './constant.js';
import type { AccessTokenResponse, OidcConfig, AuthResponse } from './types.js';
import { accessTokenResponseGuard, delimiter, authResponseGuard } from './types.js';

export const accessTokenRequester = async (
  tokenEndpoint: string,
  queryParameters: Record<string, string>,
  timeout: number = defaultTimeout
): Promise<AccessTokenResponse> => {
  try {
    const httpResponse = await got.post({
      url: tokenEndpoint,
      form: queryParameters,
      timeout: { request: timeout },
    });

    return await accessTokenResponseHandler(httpResponse);
  } catch (error: unknown) {
    if (error instanceof HTTPError) {
      throw new ConnectorError(ConnectorErrorCodes.General, { data: error.response.body });
    }
    throw error;
  }
};

const accessTokenResponseHandler = async (
  response: Response<string>
): Promise<AccessTokenResponse> => {
  const parsedBody = parseJson(response.body);
  const accessTokenResponse = connectorDataParser<AccessTokenResponse>(
    parsedBody,
    accessTokenResponseGuard
  );
  assert(
    accessTokenResponse.access_token,
    new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, {
      message: 'Missing `access_token` in token response!',
      data: accessTokenResponse,
    })
  );

  return accessTokenResponse;
};

export const isIdTokenInResponseType = (responseType: string) => {
  return responseType.split(delimiter).includes('id_token');
};

export const getIdToken = async (config: OidcConfig, data: unknown, redirectUri: string) => {
  const { code } = connectorDataParser<AuthResponse>(
    data,
    authResponseGuard,
    ConnectorErrorCodes.General
  );

  const { customConfig, ...rest } = config;

  const parameterObject = snakecaseKeys({
    ...pick(rest, 'grantType', 'clientId', 'clientSecret'),
    ...customConfig,
    code,
    redirectUri,
  });

  return accessTokenRequester(config.tokenEndpoint, parameterObject);
};
