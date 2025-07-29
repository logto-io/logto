/**
 * Reference: Manually Build a Login Flow
 * https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow
 */

import { assert } from '@silverhand/essentials';
import { got, HTTPError } from 'got';

import type {
  CreateConnector,
  SocialConnector,
  GetAuthorizationUri,
  GetUserInfo,
  GetConnectorConfig,
  GetTokenResponseAndUserInfo,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
  parseJson,
} from '@logto/connector-kit';

import {
  accessTokenEndpoint,
  authorizationEndpoint,
  scope as defaultScope,
  userInfoEndpoint,
  defaultMetadata,
  defaultTimeout,
} from './constant.js';
import type { FacebookConfig } from './types.js';
import {
  authorizationCallbackErrorGuard,
  facebookConfigGuard,
  accessTokenResponseGuard,
  userInfoResponseGuard,
  authResponseGuard,
} from './types.js';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri, scope }) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, facebookConfigGuard);

    const queryParameters = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
      scope: scope ?? config.scope ?? defaultScope,
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

export const getAccessToken = async (
  config: FacebookConfig,
  codeObject: { code: string; redirectUri: string }
) => {
  const { code, redirectUri } = codeObject;
  validateConfig(config, facebookConfigGuard);

  const { clientId: client_id, clientSecret: client_secret } = config;

  const httpResponse = await got.get(accessTokenEndpoint, {
    searchParams: {
      code,
      client_id,
      client_secret,
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

  return result.data;
};

export const getLongLivedAccessToken = async (config: FacebookConfig, accessToken: string) => {
  const { clientId: client_id, clientSecret: client_secret } = config;
  const httpResponse = await got.get(accessTokenEndpoint, {
    searchParams: {
      grant_type: 'fb_exchange_token',
      client_id,
      client_secret,
      fb_exchange_token: accessToken,
    },
    timeout: { request: defaultTimeout },
  });

  const result = accessTokenResponseGuard.safeParse(parseJson(httpResponse.body));

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
  }

  return result.data;
};

const handleAuthorizationCallback = async (
  getConfig: GetConnectorConfig,
  data: unknown,
  exchangeLongLivedAccessToken = false
) => {
  const { code, redirectUri } = await authorizationCallbackHandler(data);
  const config = await getConfig(defaultMetadata.id);
  validateConfig(config, facebookConfigGuard);
  const tokenResponse = await getAccessToken(config, { code, redirectUri });

  if (!exchangeLongLivedAccessToken) {
    return tokenResponse;
  }

  return getLongLivedAccessToken(config, tokenResponse.access_token);
};

const _getUserInfo = async (accessToken: string) => {
  try {
    const httpResponse = await got.get(userInfoEndpoint, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      searchParams: {
        fields: 'id,name,email,picture',
      },
      timeout: { request: defaultTimeout },
    });
    const rawData = parseJson(httpResponse.body);
    const result = userInfoResponseGuard.safeParse(rawData);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
    }

    const { id, email, name, picture } = result.data;

    return {
      id,
      avatar: picture?.data.url,
      email,
      name,
      rawData,
    };
  } catch (error: unknown) {
    if (error instanceof HTTPError) {
      const { statusCode, body: rawBody } = error.response;

      if (statusCode === 400) {
        throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
      }

      throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(rawBody));
    }

    throw error;
  }
};

const getTokenResponseAndUserInfo =
  (getConfig: GetConnectorConfig): GetTokenResponseAndUserInfo =>
  async (data) => {
    // Always fetch long lived access token if token storage is enabled
    const EXCHANGE_LONG_LIVED_TOKEN = true;
    const tokenResponse = await handleAuthorizationCallback(
      getConfig,
      data,
      EXCHANGE_LONG_LIVED_TOKEN
    );
    const userInfo = await _getUserInfo(tokenResponse.access_token);

    return {
      tokenResponse,
      userInfo,
    };
  };

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data) => {
    const { access_token: accessToken } = await handleAuthorizationCallback(getConfig, data);
    return _getUserInfo(accessToken);
  };

const authorizationCallbackHandler = async (parameterObject: unknown) => {
  const result = authResponseGuard.safeParse(parameterObject);

  if (result.success) {
    return result.data;
  }

  const parsedError = authorizationCallbackErrorGuard.safeParse(parameterObject);

  if (!parsedError.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, JSON.stringify(parameterObject));
  }

  const { error, error_code, error_description, error_reason } = parsedError.data;

  if (error === 'access_denied') {
    throw new ConnectorError(ConnectorErrorCodes.AuthorizationFailed, error_description);
  }

  throw new ConnectorError(ConnectorErrorCodes.General, {
    error,
    error_code,
    errorDescription: error_description,
    error_reason,
  });
};

const createFacebookConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: facebookConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
    getTokenResponseAndUserInfo: getTokenResponseAndUserInfo(getConfig),
    getAccessTokenByRefreshToken: () => {
      throw new ConnectorError(
        ConnectorErrorCodes.NotImplemented,
        'Facebook connector does not support refresh token flow.'
      );
    },
  };
};

export default createFacebookConnector;
