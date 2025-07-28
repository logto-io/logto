/**
 * The Implementation of OpenID Connect of Google Identity Platform.
 * https://developers.google.com/identity/protocols/oauth2/openid-connect
 */
import { conditional, assert } from '@silverhand/essentials';
import { got, HTTPError } from 'got';

import type {
  GetAuthorizationUri,
  GetUserInfo,
  GetConnectorConfig,
  CreateConnector,
  SocialConnector,
  GoogleConnectorConfig,
  SocialUserInfo,
  GetTokenResponseAndUserInfo,
  GetAccessTokenByRefreshToken,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
  parseJson,
  GoogleConnector,
  getAccessTokenByRefreshToken as _getAccessTokenByRefreshToken,
} from '@logto/connector-kit';
import { createRemoteJWKSet, jwtVerify } from 'jose';

import {
  accessTokenEndpoint,
  authorizationEndpoint,
  scope as defaultScope,
  userInfoEndpoint,
  defaultMetadata,
  defaultTimeout,
  jwksUri,
} from './constant.js';
import {
  accessTokenResponseGuard,
  userInfoResponseGuard,
  authResponseGuard,
  googleOneTapDataGuard,
  type AccessTokenResponse,
} from './types.js';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri, scope: customScope }) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, GoogleConnector.configGuard);

    const { clientId, scope, prompts, offlineAccess } = config;

    const queryParameters = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
      scope: customScope ?? scope ?? defaultScope,
      ...conditional(prompts && prompts.length > 0 && { prompt: prompts.join(' ') }),
      // Add `access_type=offline` if offlineAccess is enabled.
      ...conditional(offlineAccess && { access_type: 'offline' }),
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

export const getAccessToken = async (
  config: GoogleConnectorConfig,
  codeObject: { code: string; redirectUri: string }
) => {
  const { code, redirectUri } = codeObject;
  const { clientId, clientSecret } = config;

  // Note：Need to decodeURIComponent on code
  // https://stackoverflow.com/questions/51058256/google-api-node-js-invalid-grant-malformed-auth-code
  const httpResponse = await got.post(accessTokenEndpoint, {
    form: {
      code: decodeURIComponent(code),
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
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

type Json = ReturnType<typeof parseJson>;

/**
 * Get user information JSON from Google Identity Platform. It will use the following order to
 * retrieve user information:
 *
 * 1. Google One Tap: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
 * 2. Normal Google OAuth: https://developers.google.com/identity/protocols/oauth2/openid-connect
 *
 * @param data The data from the client.
 * @param config The configuration of the connector.
 * @returns An object containing user information JSON and optionally the access token response.
 */
const getUserInfoJsonAndTokenResponse = async (
  data: unknown,
  config: GoogleConnectorConfig
): Promise<{
  rawUserInfo: Json;
  tokenResponse?: AccessTokenResponse;
}> => {
  // Google One Tap
  const oneTapResult = googleOneTapDataGuard.safeParse(data);
  if (oneTapResult.success) {
    const { payload } = await jwtVerify<Json>(
      oneTapResult.data.credential,
      createRemoteJWKSet(new URL(jwksUri)),
      {
        // https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
        issuer: ['https://accounts.google.com', 'accounts.google.com'],
        audience: config.clientId,
        clockTolerance: 10,
      }
    );

    // Google One Tap will return only user information JSON.
    return {
      rawUserInfo: payload,
    };
  }

  // Normal Google OAuth
  const { code, redirectUri } = await authorizationCallbackHandler(data);
  const tokenResponse = await getAccessToken(config, { code, redirectUri });

  const { access_token: accessToken } = tokenResponse;

  const httpResponse = await got.post(userInfoEndpoint, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    timeout: { request: defaultTimeout },
  });

  return {
    rawUserInfo: parseJson(httpResponse.body),
    tokenResponse,
  };
};

const parseUserInfoResponse = (rawUserInfo: Json): SocialUserInfo => {
  const result = userInfoResponseGuard.safeParse(rawUserInfo);
  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
  }

  const { sub: id, picture: avatar, email, email_verified, name } = result.data;

  return {
    id,
    avatar,
    email: conditional(email_verified && email),
    name,
    rawData: rawUserInfo,
  };
};

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, GoogleConnector.configGuard);

    try {
      const { rawUserInfo } = await getUserInfoJsonAndTokenResponse(data, config);
      return parseUserInfoResponse(rawUserInfo);
    } catch (error: unknown) {
      return getUserInfoErrorHandler(error);
    }
  };

const getTokenResponseAndUserInfo =
  (getConfig: GetConnectorConfig): GetTokenResponseAndUserInfo =>
  async (data) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, GoogleConnector.configGuard);

    try {
      const { rawUserInfo, tokenResponse } = await getUserInfoJsonAndTokenResponse(data, config);

      return {
        userInfo: parseUserInfoResponse(rawUserInfo),
        tokenResponse,
      };
    } catch (error: unknown) {
      return getUserInfoErrorHandler(error);
    }
  };

const authorizationCallbackHandler = async (parameterObject: unknown) => {
  const result = authResponseGuard.safeParse(parameterObject);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(parameterObject));
  }

  return result.data;
};

const getUserInfoErrorHandler = (error: unknown) => {
  if (error instanceof HTTPError) {
    const { statusCode, body: rawBody } = error.response;

    if (statusCode === 401) {
      throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
    }

    throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(rawBody));
  }

  throw error;
};

const getAccessTokenByRefreshToken =
  (getConfig: GetConnectorConfig): GetAccessTokenByRefreshToken =>
  async (refreshToken: string) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, GoogleConnector.configGuard);

    return _getAccessTokenByRefreshToken(
      {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        tokenEndpoint: accessTokenEndpoint,
      },
      refreshToken
    );
  };

const createGoogleConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: GoogleConnector.configGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
    getTokenResponseAndUserInfo: getTokenResponseAndUserInfo(getConfig),
    getAccessTokenByRefreshToken: getAccessTokenByRefreshToken(getConfig),
  };
};

export default createGoogleConnector;
