/**
 * Reference: Manually Build a Login Flow
 * https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow
 */
import { existsSync, readFileSync } from 'fs';
import path from 'path';

import got, { RequestError as GotRequestError } from 'got';
import { stringify } from 'query-string';
import { z } from 'zod';

import {
  accessTokenEndpoint,
  authorizationEndpoint,
  scope,
  userInfoEndpoint,
} from '@/connectors/facebook/constant';
import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorMetadata,
  ConnectorType,
  GetAccessToken,
  GetAuthorizationUri,
  GetUserInfo,
  ValidateConfig,
} from '@/connectors/types';
import { getConnectorConfig, getConnectorRequestTimeout } from '@/connectors/utilities';
import assertThat from '@/utils/assert-that';

// eslint-disable-next-line unicorn/prefer-module
const pathToReadmeFile = path.join(__dirname, 'README.md');
const readmeContentFallback = 'Please check README.md file directory.';
export const metadata: ConnectorMetadata = {
  id: 'facebook',
  type: ConnectorType.Social,
  name: {
    en: 'Sign In with Facebook',
    'zh-CN': 'Facebook 登录',
  },
  // TODO: add the real logo URL (LOG-1823)
  logo: './logo.png',
  description: {
    en: 'Sign In with Facebook',
    'zh-CN': 'Facebook 登录',
  },
  readme: existsSync(pathToReadmeFile)
    ? readFileSync(pathToReadmeFile, 'utf8')
    : readmeContentFallback,
};

const facebookConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

type FacebookConfig = z.infer<typeof facebookConfigGuard>;

export const validateConfig: ValidateConfig = async (config: unknown) => {
  const result = facebookConfigGuard.safeParse(config);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
  }
};

export const getAuthorizationUri: GetAuthorizationUri = async (redirectUri, state) => {
  const config = await getConnectorConfig<FacebookConfig>(metadata.id);

  return `${authorizationEndpoint}?${stringify({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
    scope, // Only support fixed scope for v1.
  })}`;
};

export const getAccessToken: GetAccessToken = async (code, redirectUri) => {
  type AccessTokenResponse = {
    access_token: string;
    token_type: string;
    expires_in: number;
  };

  const { clientId: client_id, clientSecret: client_secret } =
    await getConnectorConfig<FacebookConfig>(metadata.id);

  const { access_token: accessToken } = await got
    .get(accessTokenEndpoint, {
      searchParams: {
        code,
        client_id,
        client_secret,
        redirect_uri: redirectUri,
      },
      timeout: await getConnectorRequestTimeout(),
    })
    .json<AccessTokenResponse>();

  assertThat(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

  return { accessToken };
};

export const getUserInfo: GetUserInfo = async (accessToken: string) => {
  type UserInfoResponse = {
    id: string;
    email?: string;
    name?: string;
    picture?: { data: { url: string } };
  };

  try {
    const { id, email, name, picture } = await got
      .get(userInfoEndpoint, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        searchParams: {
          fields: 'id,name,email,picture',
        },
        timeout: await getConnectorRequestTimeout(),
      })
      .json<UserInfoResponse>();

    return {
      id,
      avatar: picture?.data.url,
      email,
      name,
    };
  } catch (error: unknown) {
    if (error instanceof GotRequestError && error.response?.statusCode === 400) {
      throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
    }
    throw error;
  }
};
