/**
 * The Implementation of OpenID Connect of Google Identity Platform.
 * https://developers.google.com/identity/protocols/oauth2/openid-connect
 */
import { existsSync, readFileSync } from 'fs';
import path from 'path';

import { conditional } from '@silverhand/essentials';
import got, { RequestError as GotRequestError } from 'got';
import { stringify } from 'query-string';
import { z } from 'zod';

import assertThat from '@/utils/assert-that';

import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorMetadata,
  ConnectorType,
  GetAccessToken,
  GetAuthorizationUri,
  GetUserInfo,
  ValidateConfig,
} from '../types';
import { getConnectorConfig, getConnectorRequestTimeout } from '../utilities';
import { accessTokenEndpoint, authorizationEndpoint, scope, userInfoEndpoint } from './constant';

// eslint-disable-next-line unicorn/prefer-module
const pathToReadmeFile = path.join(__dirname, 'README.md');
const readmeContentFallback = 'Please check README.md file directory.';
export const metadata: ConnectorMetadata = {
  id: 'google',
  type: ConnectorType.Social,
  name: {
    en: 'Sign In with Google',
    'zh-CN': 'Google登录',
  },
  // TODO: add the real logo URL (LOG-1823)
  logo: './logo.png',
  description: {
    en: 'Sign In with Google',
    'zh-CN': 'Google登录',
  },
  readme: existsSync(pathToReadmeFile)
    ? readFileSync(pathToReadmeFile, 'utf8')
    : readmeContentFallback,
};

const googleConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

type GoogleConfig = z.infer<typeof googleConfigGuard>;

export const validateConfig: ValidateConfig = async (config: unknown) => {
  const result = googleConfigGuard.safeParse(config);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
  }
};

export const getAuthorizationUri: GetAuthorizationUri = async (redirectUri, state) => {
  const config = await getConnectorConfig<GoogleConfig>(metadata.id);

  return `${authorizationEndpoint}?${stringify({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
    scope,
  })}`;
};

export const getAccessToken: GetAccessToken = async (code, redirectUri) => {
  type AccessTokenResponse = {
    access_token: string;
    scope: string;
    token_type: string;
  };

  const { clientId, clientSecret } = await getConnectorConfig<GoogleConfig>(metadata.id);

  // Note：Need to decodeURIComponent on code
  // https://stackoverflow.com/questions/51058256/google-api-node-js-invalid-grant-malformed-auth-code
  const { access_token: accessToken } = await got
    .post(accessTokenEndpoint, {
      form: {
        code: decodeURIComponent(code),
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      },
      timeout: await getConnectorRequestTimeout(),
      followRedirect: true,
    })
    .json<AccessTokenResponse>();

  assertThat(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

  return { accessToken };
};

export const getUserInfo: GetUserInfo = async (accessTokenObject) => {
  type UserInfoResponse = {
    sub: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    email?: string;
    email_verified?: boolean;
    locale?: string;
  };

  const { accessToken } = accessTokenObject;

  try {
    const {
      sub: id,
      picture: avatar,
      email,
      email_verified,
      name,
    } = await got
      .post(userInfoEndpoint, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        timeout: await getConnectorRequestTimeout(),
      })
      .json<UserInfoResponse>();

    return {
      id,
      avatar,
      email: conditional(email_verified && email),
      name,
    };
  } catch (error: unknown) {
    if (error instanceof GotRequestError && error.response?.statusCode === 401) {
      throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
    }
    throw error;
  }
};
