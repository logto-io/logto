import { ConnectorType } from '@logto/schemas';
import got from 'got';
import { stringify } from 'query-string';
import { z } from 'zod';

import { ConnectorMetadata, GetAccessToken, GetAuthorizationUri } from '../types';
import { getConnectorConfig } from '../utilities';
import { authorizationEndpoint, accessTokenEndpoint, scope } from './constant';

export const metadata: ConnectorMetadata = {
  id: 'github',
  type: ConnectorType.Social,
  name: {
    en: 'Sign In with GitHub',
    zh_CN: 'GitHub登录',
  },
  logo: './logo.png',
  description: {
    en: 'Sign In with GitHub',
    zh_CN: 'GitHub登录',
  },
};

const githubConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

type GithubConfig = z.infer<typeof githubConfigGuard>;

export const getAuthorizationUri: GetAuthorizationUri = async (redirectUri, state) => {
  const config = await getConnectorConfig<GithubConfig>(metadata.id, metadata.type);
  return `${authorizationEndpoint}?${stringify({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    state,
    scope, // Only support fixed scope for v1.
  })}`;
};

export const getAccessToken: GetAccessToken = async (code) => {
  const { clientId: client_id, clientSecret: client_secret } =
    await getConnectorConfig<GithubConfig>(metadata.id, metadata.type);
  const { access_token: accessToken } = await got
    .post({
      url: accessTokenEndpoint,
      json: {
        client_id,
        client_secret,
        code,
      },
    })
    .json<{
      access_token: string;
      scope: string;
      token_type: string;
    }>();
  return accessToken;
};
