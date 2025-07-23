import { conditional } from '@silverhand/essentials';

import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
  parseJson,
} from '@logto/connector-kit';
import type {
  GetAuthorizationUri,
  GetUserInfo,
  SocialConnector,
  CreateConnector,
  GetConnectorConfig,
} from '@logto/connector-kit';
import ky, { HTTPError } from 'ky';

import {
  authorizationEndpoint,
  accessTokenEndpoint,
  defaultMetadata,
  defaultTimeout,
  defaultScope,
} from './constant.js';
import {
  slackConfigGuard,
  authResponseGuard,
  accessTokenResponseGuard,
  type SlackConfig,
  userInfoResponseGuard,
} from './types.js';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri, scope }, setSession) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, slackConfigGuard);

    await setSession({
      redirectUri,
    });

    const queryParams = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: redirectUri,
      scope: scope ?? config.scope ?? defaultScope,
      state,
    });

    return `${authorizationEndpoint}?${queryParams.toString()}`;
  };

export const getAccessToken = async (config: SlackConfig, code: string, redirectUri: string) => {
  const queryParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const response = await ky
    .post(accessTokenEndpoint, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: queryParams.toString(),
      timeout: defaultTimeout,
    })
    .json();

  return accessTokenResponseGuard.parse(response);
};

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data, getSession) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, slackConfigGuard);

    const authResponseResult = authResponseGuard.safeParse(data);

    if (!authResponseResult.success) {
      throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(data));
    }

    const { code } = authResponseResult.data;
    const { redirectUri } = await getSession();

    if (!redirectUri) {
      throw new ConnectorError(ConnectorErrorCodes.General, {
        message: 'Cannot find `redirectUri` from connector session.',
      });
    }

    try {
      const { id_token } = await getAccessToken(config, code, redirectUri);

      const [, payload] = id_token.split('.');

      if (!payload) {
        throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
      }

      const decodedPayload = Buffer.from(payload, 'base64').toString('utf8');
      const rawData = parseJson(decodedPayload);
      const userInfo = userInfoResponseGuard.parse(rawData);

      const { sub, name, picture, email, email_verified } = userInfo;

      return {
        id: sub,
        name: conditional(name),
        rawData,
        image: conditional(picture),
        email: conditional(email_verified && email),
      };
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const { status, body: rawBody } = error.response;

        if (status === 401) {
          throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
        }

        throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(rawBody));
      }

      throw error;
    }
  };

const createSlackConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: slackConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createSlackConnector;
