import got, { RequestError as GotRequestError } from 'got';
import { stringify } from 'query-string';
import { z } from 'zod';

import RequestError from '@/errors/RequestError';

import {
  ConnectorConfigError,
  ConnectorMetadata,
  GetAccessToken,
  GetAuthorizationUri,
  ValidateConfig,
  GetUserInfo,
  ConnectorType,
} from '../types';
import { getConnectorConfig } from '../utilities';
import { authorizationEndpoint, accessTokenEndpoint, scope, userInfoEndpoint } from './constant';

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

export const validateConfig: ValidateConfig = async (config: unknown) => {
  if (!config) {
    throw new ConnectorConfigError('Missing config');
  }

  const result = githubConfigGuard.safeParse(config);

  if (!result.success) {
    throw new ConnectorConfigError(result.error.message);
  }
};

export const getAuthorizationUri: GetAuthorizationUri = async (redirectUri, state) => {
  const config = await getConnectorConfig<GithubConfig>(metadata.id);

  return `${authorizationEndpoint}?${stringify({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    state,
    scope, // Only support fixed scope for v1.
  })}`;
};

export const getAccessToken: GetAccessToken = async (code) => {
  type AccessTokenResponse = {
    access_token: string;
    scope: string;
    token_type: string;
  };

  const { clientId: client_id, clientSecret: client_secret } =
    await getConnectorConfig<GithubConfig>(metadata.id);

  const { access_token: accessToken } = await got
    .post({
      url: accessTokenEndpoint,
      json: {
        client_id,
        client_secret,
        code,
      },
    })
    .json<AccessTokenResponse>();

  if (!accessToken) {
    throw new RequestError({
      code: 'connector.oauth_code_invalid',
      status: 401,
    });
  }

  return accessToken;
};

export const getUserInfo: GetUserInfo = async (accessToken: string) => {
  type UserInfoResponse = {
    id: number;
    avatar_url: string;
    email: string;
    name: string;
  };

  try {
    const {
      id,
      avatar_url: avatar,
      email,
      name,
    } = await got
      .get(userInfoEndpoint, {
        headers: {
          authorization: `token ${accessToken}`,
        },
      })
      .json<UserInfoResponse>();

    return {
      id: String(id),
      avatar,
      email,
      name,
    };
  } catch (error: unknown) {
    if (error instanceof GotRequestError && error.response?.statusCode === 401) {
      throw new RequestError({
        code: 'connector.access_token_invalid',
        status: 401,
      });
    }
    throw error;
  }
};
