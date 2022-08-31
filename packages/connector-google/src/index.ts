/**
 * The Implementation of OpenID Connect of Google Identity Platform.
 * https://developers.google.com/identity/protocols/oauth2/openid-connect
 */
import {
  ConnectorError,
  ConnectorErrorCodes,
  GetAuthorizationUri,
  GetUserInfo,
  GetConnectorConfig,
  validateConfig,
  CreateConnector,
  SocialConnector,
  ConnectorType,
  jsonSafeParse,
} from '@logto/connector-core';
import { conditional, assert } from '@silverhand/essentials';
import got, { HTTPError } from 'got';

import {
  accessTokenEndpoint,
  authorizationEndpoint,
  scope,
  userInfoEndpoint,
  defaultMetadata,
  defaultTimeout,
} from './constant';
import {
  googleConfigGuard,
  GoogleConfig,
  accessTokenResponseGuard,
  userInfoResponseGuard,
  authResponseGuard,
} from './types';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri }) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig<GoogleConfig>(config, googleConfigGuard);

    const queryParameters = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
      scope,
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

export const getAccessToken = async (
  config: GoogleConfig,
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
    timeout: defaultTimeout,
  });

  const result = accessTokenResponseGuard.safeParse(jsonSafeParse(httpResponse.body));

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
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
    validateConfig<GoogleConfig>(config, googleConfigGuard);
    const { accessToken } = await getAccessToken(config, { code, redirectUri });

    try {
      const httpResponse = await got.post(userInfoEndpoint, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        timeout: defaultTimeout,
      });

      const result = userInfoResponseGuard.safeParse(jsonSafeParse(httpResponse.body));

      if (!result.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
      }

      const { sub: id, picture: avatar, email, email_verified, name } = result.data;

      return {
        id,
        avatar,
        email: conditional(email_verified && email),
        name,
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

const createGoogleConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: googleConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createGoogleConnector;
