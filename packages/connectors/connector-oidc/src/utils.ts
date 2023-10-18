import { pick } from '@silverhand/essentials';
import type { Response } from 'got';
import { got, HTTPError } from 'got';
import snakecaseKeys from 'snakecase-keys';

import {
  ConnectorError,
  ConnectorErrorCodes,
  parseJson,
  oidcAuthorizationResponseGuard,
  oidcTokenResponseGuard,
  type OidcTokenResponse,
} from '@logto/connector-kit';

import { defaultTimeout } from './constant.js';
import type { OidcConfig } from './types.js';

export const accessTokenRequester = async (
  tokenEndpoint: string,
  queryParameters: Record<string, string>,
  timeout: number = defaultTimeout
): Promise<OidcTokenResponse> => {
  try {
    const httpResponse = await got.post({
      url: tokenEndpoint,
      form: queryParameters,
      timeout: { request: timeout },
    });

    return accessTokenResponseHandler(httpResponse);
  } catch (error: unknown) {
    if (error instanceof HTTPError) {
      throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(error.response.body));
    }
    throw error;
  }
};

const accessTokenResponseHandler = (response: Response<string>): OidcTokenResponse => {
  const result = oidcTokenResponseGuard.safeParse(parseJson(response.body));

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
  }

  return result.data;
};

export const getIdToken = async (config: OidcConfig, data: unknown, redirectUri: string) => {
  const result = oidcAuthorizationResponseGuard.safeParse(data);

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
