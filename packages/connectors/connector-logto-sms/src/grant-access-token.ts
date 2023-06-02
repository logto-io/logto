import { got } from 'got';

import { connectorDataParser, parseJsonObject } from '@logto/connector-kit';

import { defaultTimeout, scope } from './constant.js';
import { accessTokenResponseGuard, type AccessTokenResponse } from './types.js';

export type GrantAccessTokenParameters = {
  tokenEndpoint: string;
  resource: string;
  appId: string;
  appSecret: string;
};

// TODO (LOG-5741) refactor to use @logto/connector-kit
export const grantAccessToken = async ({
  tokenEndpoint,
  resource,
  appId,
  appSecret,
}: GrantAccessTokenParameters) => {
  const httpResponse = await got.post({
    url: tokenEndpoint,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${appId}:${appSecret}`).toString('base64')}`,
    },
    timeout: { request: defaultTimeout },
    form: {
      grant_type: 'client_credentials',
      resource,
      scope,
    },
  });

  const parsedBody = parseJsonObject(httpResponse.body);
  return connectorDataParser<AccessTokenResponse>(parsedBody, accessTokenResponseGuard);
};
