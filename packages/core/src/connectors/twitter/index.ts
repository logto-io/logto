import got, { RequestError as GotRequestError } from 'got';
import { stringify } from 'query-string';
import { z } from 'zod';

import {
  accessTokenEndpoint,
  authorizationEndpoint,
  scope,
  userInfoEndpoint,
} from '@/connectors/twitter/constant';
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

export const metadata: ConnectorMetadata = {
  id: 'twitter',
  type: ConnectorType.Social,
  name: {
    en: 'Sign In with Twitter',
    zh_CN: 'Twitter 登录',
  },
  logo: './logo.png',
  description: {
    en: 'Sign In with Twitter',
    zh_CN: 'Twitter 登录',
  },
};

const twitterConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

type TwitterConfig = z.infer<typeof twitterConfigGuard>;

export const validateConfig: ValidateConfig = async (config: unknown) => {
  if (!config) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, 'Missing config');
  }

  const result = twitterConfigGuard.safeParse(config);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
  }
};

export const getAuthorizationUri: GetAuthorizationUri = async (redirectUri, state) => {
  const config = await getConnectorConfig<TwitterConfig>(metadata.id);

  return `${authorizationEndpoint}?${stringify({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    state,
    scope, // Only support fixed scope for v1.
  })}`;
};

export const getAccessToken: GetAccessToken = async (code, redirectUri) => {
  type AccessTokenResponse = {
    access_token: string;
    scope: string;
    token_type: string;
  };

  const { clientId: client_id, clientSecret: client_secret } =
    await getConnectorConfig<TwitterConfig>(metadata.id);

  const { access_token: accessToken } = await got
    .post({
      url: accessTokenEndpoint,
      json: {
        code,
        client_id,
        client_secret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      },
      timeout: await getConnectorRequestTimeout(),
    })
    .json<AccessTokenResponse>();

  if (!accessToken) {
    throw new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid);
  }

  return accessToken;
};

export const getUserInfo: GetUserInfo = async (accessToken: string) => {
  type UserInfoResponse = {
    id: number;
    avatar_url?: string; // TODO
    email?: string; // TODO
    name?: string;
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
        json: {
          include_entities: true, // TODO test
          skip_status: true,
          include_email: true,
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
