import { existsSync, readFileSync } from 'fs';
import path from 'path';

import got, { RequestError as GotRequestError } from 'got';
import { stringify } from 'query-string';
import { z } from 'zod';

import assertThat from '@/utils/assert-that';

import {
  ConnectorMetadata,
  GetAccessToken,
  GetAuthorizationUri,
  ValidateConfig,
  GetUserInfo,
  ConnectorType,
  ConnectorError,
  ConnectorErrorCodes,
} from '../types';
import { getConnectorConfig, getConnectorRequestTimeout } from '../utilities';
import { authorizationEndpoint, accessTokenEndpoint, scope, userInfoEndpoint } from './constant';

// eslint-disable-next-line unicorn/prefer-module
const pathToReadmeFile = path.join(__dirname, 'README.md');
const readmeContentFallback = 'Please check README.md file directory.';
export const metadata: ConnectorMetadata = {
  id: 'github',
  type: ConnectorType.Social,
  name: {
    en: 'Sign In with GitHub',
    'zh-CN': 'GitHub登录',
  },
  logo: 'https://user-images.githubusercontent.com/5717882/156983224-7ea0296b-38fa-419d-9515-67e8a9612e09.png',
  description: {
    en: 'Sign In with GitHub',
    'zh-CN': 'GitHub登录',
  },
  readme: existsSync(pathToReadmeFile)
    ? readFileSync(pathToReadmeFile, 'utf8')
    : readmeContentFallback,
};

const githubConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

type GithubConfig = z.infer<typeof githubConfigGuard>;

export const validateConfig: ValidateConfig = async (config: unknown) => {
  const result = githubConfigGuard.safeParse(config);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
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
      timeout: await getConnectorRequestTimeout(),
    })
    .json<AccessTokenResponse>();

  assertThat(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

  return { accessToken };
};

export const getUserInfo: GetUserInfo = async (accessTokenObject) => {
  type UserInfoResponse = {
    id: number;
    avatar_url?: string;
    email?: string;
    name?: string;
  };

  const { accessToken } = accessTokenObject;

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
        timeout: await getConnectorRequestTimeout(),
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
      throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
    }
    throw error;
  }
};
