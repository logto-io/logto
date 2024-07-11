import { assert } from '@silverhand/essentials';

import {
  socialUserInfoGuard,
  validateConfig,
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorType,
} from '@logto/connector-kit';
import type {
  GetConnectorConfig,
  GetAuthorizationUri,
  GetUserInfo,
  CreateConnector,
  SocialConnector,
} from '@logto/connector-kit';
import ky, { HTTPError } from 'ky';

import {
  defaultMetadata,
  scope as defaultScope,
  authorizationEndpoint,
  accessTokenEndpoint,
  userInfoEndpoint,
  defaultTimeout,
} from './constant.js';
import type { KookConfig } from './types.js';
import {
  kookConfigGuard,
  accessTokenResponseGuard,
  userInfoResponseGuard,
  authResponseGuard,
} from './types.js';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri }) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, kookConfigGuard);

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
  config: KookConfig,
  codeObject: { code: string; redirectUri: string }
) => {
  const { code, redirectUri } = codeObject;

  const { clientId: client_id, clientSecret: client_secret } = config;

  const httpResponse = await ky
    .post(accessTokenEndpoint, {
      body: new URLSearchParams({
        client_id,
        client_secret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
      timeout: defaultTimeout,
    })
    .json();

  const result = accessTokenResponseGuard.safeParse(httpResponse);

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
    validateConfig(config, kookConfigGuard);
    const { accessToken } = await getAccessToken(config, { code, redirectUri });

    try {
      const httpResponse = await ky
        .get(userInfoEndpoint, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
          timeout: defaultTimeout,
        })
        .json();

      const result = userInfoResponseGuard.safeParse(httpResponse);

      if (!result.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
      }

      const {
        data: { id, username: name, avatar },
      } = result.data;

      const rawUserInfo = {
        id,
        name,
        avatar,
      };

      const userInfoResult = socialUserInfoGuard.safeParse(rawUserInfo);

      if (!userInfoResult.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, userInfoResult.error);
      }

      return { ...userInfoResult.data, rawData: result.data.data };
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

const authorizationCallbackHandler = async (parameterObject: unknown) => {
  const result = authResponseGuard.safeParse(parameterObject);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(parameterObject));
  }

  return result.data;
};

const createKookConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: kookConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createKookConnector;
