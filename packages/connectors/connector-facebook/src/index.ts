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
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
  parseJson,
  connectorDataParser,
} from '@logto/connector-kit';

import {
  accessTokenEndpoint,
  authorizationEndpoint,
  scope as defaultScope,
  userInfoEndpoint,
  defaultMetadata,
  defaultTimeout,
} from './constant.js';
import type { FacebookConfig, AccessTokenResponse, UserInfoResponse } from './types.js';
import {
  authorizationCallbackErrorGuard,
  facebookConfigGuard,
  accessTokenResponseGuard,
  userInfoResponseGuard,
  authResponseGuard,
} from './types.js';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri }) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig<FacebookConfig>(config, facebookConfigGuard);

    const queryParameters = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
      scope: config.scope ?? defaultScope,
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

export const getAccessToken = async (
  config: FacebookConfig,
  codeObject: { code: string; redirectUri: string }
) => {
  const { code, redirectUri } = codeObject;
  validateConfig<FacebookConfig>(config, facebookConfigGuard);

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
    const { code, redirectUri } = await authorizationCallbackHandler(data);
    const config = await getConfig(defaultMetadata.id);
    validateConfig<FacebookConfig>(config, facebookConfigGuard);
    const { accessToken } = await getAccessToken(config, { code, redirectUri });

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

      const parsedBody = parseJson(httpResponse.body);
      const { id, email, name, picture } = connectorDataParser<UserInfoResponse>(
        parsedBody,
        userInfoResponseGuard
      );

      return {
        id,
        avatar: picture?.data.url,
        email,
        name,
      };
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const { statusCode } = error.response;

        throw new ConnectorError(
          statusCode === 400
            ? ConnectorErrorCodes.SocialAccessTokenInvalid
            : ConnectorErrorCodes.General,
          { data: error.response }
        );
      }

      throw error;
    }
  };

const authorizationCallbackHandler = async (parameterObject: unknown) => {
  const result = authResponseGuard.safeParse(parameterObject);

  if (result.success) {
    return result.data;
  }

  const parsedError = authorizationCallbackErrorGuard.safeParse(parameterObject);

  if (!parsedError.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, {
      data: parameterObject,
      zodError: parsedError.error,
    });
  }

  throw new ConnectorError(
    parsedError.data.error === 'access_denied'
      ? ConnectorErrorCodes.AuthorizationFailed
      : ConnectorErrorCodes.General,
    { data: parsedError.data }
  );
};

const createFacebookConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: facebookConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createFacebookConnector;
