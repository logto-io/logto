import { ConnectorType } from '@logto/schemas';
import { stringify } from 'query-string';
import { z } from 'zod';

import { ConnectorMetadata, GetAuthorizeUri } from '../types';
import { getConnectorConfig } from '../utilities';
import { authorizationEndpoint, scope } from './constant';

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

export const getAuthorizeUri: GetAuthorizeUri = async (redirectUri, state) => {
  const config = await getConnectorConfig<GithubConfig>(metadata.id, metadata.type);
  return `${authorizationEndpoint}?${stringify({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    state,
    scope, // Only support fixed scope for v1.
  })}`;
};
