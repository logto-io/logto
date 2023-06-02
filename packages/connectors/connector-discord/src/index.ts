/**
 * Discord OAuth2 Connector
 * https://discord.com/developers/docs/topics/oauth2
 */

import { conditional, assert } from '@silverhand/essentials';
import { got, HTTPError } from 'got';
import { type z } from 'zod';

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
  connectorDataParser,
} from '@logto/connector-kit';

import {
  defaultMetadata,
  scope as defaultScope,
  authorizationEndpoint,
  accessTokenEndpoint,
  defaultTimeout,
  userInfoEndpoint,
} from './constant.js';
import type {
  DiscordConfig,
  AccessTokenResponse,
  UserInfoResponse,
  AuthResponse,
} from './types.js';
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
    validateConfig<DiscordConfig>(config, discordConfigGuard);

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

  const parsedBody = parseJson(httpResponse.body);
  const { access_token: accessToken } = connectorDataParser<AccessTokenResponse>(
    parsedBody,
    accessTokenResponseGuard
  );
  assert(
    accessToken,
    new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, {
      data: accessToken,
      message: 'accessToken is empty',
    })
  );
  return { accessToken };
};

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data) => {
    const { code, redirectUri } = connectorDataParser<AuthResponse>(
      data,
      authResponseGuard,
      ConnectorErrorCodes.General
    );
    const config = await getConfig(defaultMetadata.id);
    validateConfig<DiscordConfig>(config, discordConfigGuard);
    const { accessToken } = await getAccessToken(config, { code, redirectUri });

    try {
      const httpResponse = await got.get(userInfoEndpoint, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        timeout: { request: defaultTimeout },
      });

      const parsedBody = parseJson(httpResponse.body);
      const {
        id,
        username: name,
        avatar,
        email,
        verified,
      } = connectorDataParser<UserInfoResponse, z.input<typeof userInfoResponseGuard>>(
        parsedBody,
        userInfoResponseGuard
      );

      const rawUserInfo = {
        id,
        name,
        avatar: conditional(avatar && `https://cdn.discordapp.com/avatars/${id}/${avatar}`),
        email: conditional(verified && email),
      };

      const userInfoResult = socialUserInfoGuard.safeParse(rawUserInfo);

      if (!userInfoResult.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, {
          zodError: userInfoResult.error,
          data: rawUserInfo,
        });
      }

      return userInfoResult.data;
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const { statusCode } = error.response;

        throw new ConnectorError(
          statusCode === 401
            ? ConnectorErrorCodes.SocialAccessTokenInvalid
            : ConnectorErrorCodes.General,
          { data: error.response }
        );
      }

      throw error;
    }
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
