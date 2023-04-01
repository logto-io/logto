import { ConnectorError, ConnectorErrorCodes, parseJson } from '@logto/connector-kit';
import { assert, pick } from '@silverhand/essentials';
import type { Response } from 'got';
import { got, HTTPError } from 'got';
import snakecaseKeys from 'snakecase-keys';

import { defaultTimeout } from './constant.js';
import type { AccessTokenResponse, OidcConfig } from './types.js';
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
      throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(error.response.body));
    }
    throw error;
  }
};

const accessTokenResponseHandler = async (
  response: Response<string>
): Promise<AccessTokenResponse> => {
  const result = accessTokenResponseGuard.safeParse(parseJson(response.body));

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
  }

  assert(
    result.data.access_token,
    new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, {
      message: 'Missing `access_token` in token response!',
    })
  );

  return result.data;
};

export const isIdTokenInResponseType = (responseType: string) => {
  return responseType.split(delimiter).includes('id_token');
};

export const getIdToken = async (config: OidcConfig, data: unknown, redirectUri: string) => {
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

  return accessTokenRequester(config.tokenEndpoint, parameterObject);
};
