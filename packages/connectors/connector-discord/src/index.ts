/**
 * Discord OAuth2 Connector
 * https://discord.com/developers/docs/topics/oauth2
 */

import { assert, conditional } from '@silverhand/essentials';
import { got, HTTPError } from 'got';

import type {
  GetConnectorConfig,
  GetAuthorizationUri,
  GetUserInfo,
  CreateConnector,
  SocialConnector,
} from '@logto/connector-kit';
import {
  socialUserInfoGuard,
  validateConfig,
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorType,
  parseJson,
} from '@logto/connector-kit';

import {
  defaultMetadata,
  scope as defaultScope,
  authorizationEndpoint,
  accessTokenEndpoint,
  defaultTimeout,
  userInfoEndpoint,
} from './constant.js';
import type { DiscordConfig } from './types.js';
import {
  discordConfigGuard,
  authResponseGuard,
  accessTokenResponseGuard,
  userInfoResponseGuard,
} from './types.js';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri }) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, discordConfigGuard);

    const queryParameters = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: config.scope ?? defaultScope,
      state,
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

export const getAccessToken = async (
  config: DiscordConfig,
  codeObject: { code: string; redirectUri: string }
) => {
  const { code, redirectUri } = codeObject;

  const { clientId: client_id, clientSecret: client_secret } = config;

  const httpResponse = await got.post(accessTokenEndpoint, {
    form: {
      client_id,
      client_secret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    },
    timeout: { request: defaultTimeout },
  });

  const result = accessTokenResponseGuard.safeParse(parseJson(httpResponse.body));

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
  }

  const { access_token: accessToken } = result.data;

  assert(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

  return { accessToken };
};

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data) => {
    const { code, redirectUri } = await authorizationCallbackHandler(data);
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, discordConfigGuard);
    const { accessToken } = await getAccessToken(config, { code, redirectUri });

    try {
      const httpResponse = await got.get(userInfoEndpoint, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        timeout: { request: defaultTimeout },
      });
      const rawData = parseJson(httpResponse.body);
      const result = userInfoResponseGuard.safeParse(rawData);

      if (!result.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
      }

      const { id, username: name, avatar, email, verified } = result.data;

      const rawUserInfo = {
        id,
        name,
        avatar: conditional(avatar && `https://cdn.discordapp.com/avatars/${id}/${avatar}`),
        email: conditional(verified && email),
      };

      const userInfoResult = socialUserInfoGuard.safeParse(rawUserInfo);

      if (!userInfoResult.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, userInfoResult.error);
      }

      return { ...userInfoResult.data, rawData };
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const { statusCode, body: rawBody } = error.response;

        if (statusCode === 401) {
          throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
        }

        throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(rawBody));
      }

      throw error;
    }
  };

const authorizationCallbackHandler = async (parameterObject: unknown) => {
  const result = authResponseGuard.safeParse(parameterObject);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(parameterObject));
  }

  return result.data;
};

const createDiscordConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: discordConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createDiscordConnector;
