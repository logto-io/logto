import { assert, conditional } from '@silverhand/essentials';

import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
  jsonGuard,
  type GetAuthorizationUri,
  type GetUserInfo,
  type SocialConnector,
  type CreateConnector,
  type GetConnectorConfig,
} from '@logto/connector-kit';
import ky, { HTTPError } from 'ky';

import {
  authorizationEndpoint,
  accessTokenEndpoint,
  userInfoEndpoint,
  defaultScope,
  defaultMetadata,
  defaultTimeout,
} from './constant.js';
import type { XiaomiConfig } from './types.js';
import {
  xiaomiConfigGuard,
  accessTokenResponseGuard,
  userInfoResponseGuard,
  authorizationCallbackErrorGuard,
  authResponseGuard,
  getUserInfoErrorGuard,
} from './types.js';

const authorizationCallbackHandler = async (parameterObject: unknown) => {
  const result = authResponseGuard.safeParse(parameterObject);

  if (!result.success) {
    const parsedError = authorizationCallbackErrorGuard.safeParse(parameterObject);

    if (!parsedError.success) {
      throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(parameterObject));
    }

    const { error, error_description } = parsedError.data;

    throw new ConnectorError(ConnectorErrorCodes.General, {
      error,
      errorDescription: error_description,
    });
  }

  return result.data;
};

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri, scope }) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, xiaomiConfigGuard);

    const queryParameters = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
      scope: scope ?? config.scope ?? defaultScope,
      skip_confirm: String(config.skipConfirm ?? false),
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

export const getAccessToken = async (
  config: XiaomiConfig,
  codeObject: { code: string },
  redirectUri: string
) => {
  const { code } = codeObject;
  const { clientId: client_id, clientSecret: client_secret } = config;

  const formData = new URLSearchParams({
    client_id,
    client_secret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });

  const httpResponse = await ky
    .post(accessTokenEndpoint, {
      body: formData,
      timeout: defaultTimeout,
    })
    .text();

  const jsonResponse = jsonGuard.parse(JSON.parse(httpResponse.replace('&&&START&&&', '')));

  const result = accessTokenResponseGuard.safeParse(jsonResponse);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid);
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
    validateConfig(config, xiaomiConfigGuard);
    const { accessToken } = await getAccessToken(config, { code }, redirectUri);

    try {
      const response = await ky
        .get(userInfoEndpoint, {
          searchParams: {
            clientId: config.clientId,
            token: accessToken,
          },
          timeout: defaultTimeout,
        })
        .json();

      const userInfoResult = userInfoResponseGuard.safeParse(response);

      if (!userInfoResult.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse);
      }

      const {
        data: { miliaoNick, unionId, miliaoIcon },
      } = userInfoResult.data;

      return {
        id: unionId,
        avatar: conditional(miliaoIcon),
        name: conditional(miliaoNick),
        rawData: jsonGuard.parse(response),
      };
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const errorBody: unknown = await error.response.json();
        const parsedError = getUserInfoErrorGuard.safeParse(errorBody);

        if (!parsedError.success) {
          throw new ConnectorError(ConnectorErrorCodes.General, parsedError.error);
        }

        const { code, description } = parsedError.data;
        if (error.response.status === 403) {
          throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
        }

        throw new ConnectorError(ConnectorErrorCodes.General, {
          code,
          description,
        });
      }

      throw error;
    }
  };

const createXiaomiConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: xiaomiConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createXiaomiConnector;
