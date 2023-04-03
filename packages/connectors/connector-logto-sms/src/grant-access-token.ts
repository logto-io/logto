import { got } from 'got';

import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';

import { defaultTimeout, scope } from './constant.js';
import { accessTokenResponseGuard } from './types.js';

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

  const result = accessTokenResponseGuard.safeParse(JSON.parse(httpResponse.body));

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
  }

  return result.data;
};
