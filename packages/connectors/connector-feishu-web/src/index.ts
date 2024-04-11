import { assert, conditional } from '@silverhand/essentials';
import { got, HTTPError } from 'got';

import type {
  CreateConnector,
  GetAuthorizationUri,
  GetConnectorConfig,
  GetUserInfo,
  SocialConnector,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorPlatform,
  ConnectorType,
  jsonGuard,
  validateConfig,
} from '@logto/connector-kit';

import {
  accessTokenEndpoint,
  codeEndpoint,
  defaultMetadata,
  userInfoEndpoint,
} from './constant.js';
import {
  feishuAccessTokenResponse,
  feishuAuthCodeGuard,
  feishuConfigGuard,
  feishuErrorResponse,
  feishuUserInfoResponse,
} from './types.js';

export function buildAuthorizationUri(
  clientId: string,
  redirectUri: string,
  state: string
): string {
  const queryParameters = new URLSearchParams({
    client_id: clientId,
    redirect_uri: encodeURI(redirectUri),
    response_type: 'code',
    state,
  });

  return `${codeEndpoint}?${queryParameters.toString()}`;
}

export function getAuthorizationUri(getConfig: GetConnectorConfig): GetAuthorizationUri {
  return async function ({ state, redirectUri }) {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, feishuConfigGuard);

    const { appId } = config;

    return buildAuthorizationUri(appId, redirectUri, state);
  };
}

export async function authorizationCallbackHandler(data: unknown) {
  const result = feishuAuthCodeGuard.safeParse(data);
  assert(
    result.success,
    new ConnectorError(ConnectorErrorCodes.InvalidResponse, JSON.stringify(data))
  );

  return result.data;
}

export async function getAccessToken(
  code: string,
  appId: string,
  appSecret: string,
  redirectUri: string
) {
  try {
    const response = await got.post(accessTokenEndpoint, {
      headers: {
        contentType: 'application/www-form-urlencoded',
      },
      form: {
        grant_type: 'authorization_code',
        code,
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: redirectUri,
      },
      responseType: 'json',
    });

    const result = feishuAccessTokenResponse.safeParse(response.body);
    assert(
      result.success,
      new ConnectorError(ConnectorErrorCodes.InvalidResponse, JSON.stringify(response.body))
    );

    if (result.data.access_token.length === 0) {
      throw new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, 'access_token is empty');
    }

    return { accessToken: result.data.access_token };
  } catch (error: unknown) {
    if (error instanceof ConnectorError) {
      throw error;
    }

    if (error instanceof HTTPError) {
      const result = feishuErrorResponse.safeParse(error.response.body);
      assert(
        result.success,
        new ConnectorError(ConnectorErrorCodes.InvalidResponse, JSON.stringify(error.response.body))
      );

      throw new ConnectorError(
        ConnectorErrorCodes.SocialAuthCodeInvalid,
        result.data.error_description
      );
    }

    throw new ConnectorError(ConnectorErrorCodes.General, {
      errorDescription: 'Failed to get access token',
    });
  }
}

export function getUserInfo(getConfig: GetConnectorConfig): GetUserInfo {
  return async function (data) {
    const { code, redirectUri } = await authorizationCallbackHandler(data);
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, feishuConfigGuard);

    const { accessToken } = await getAccessToken(code, config.appId, config.appSecret, redirectUri);

    try {
      const response = await got.get(userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'json',
      });

      const result = feishuUserInfoResponse.safeParse(response.body);
      assert(
        result.success,
        new ConnectorError(ConnectorErrorCodes.InvalidResponse, `invalid user response`)
      );

      const { sub, user_id, name, email, avatar_url: avatar, mobile } = result.data;

      return {
        id: sub,
        name,
        avatar,
        email: conditional(email),
        userId: conditional(user_id),
        phone: conditional(mobile),
        rawData: jsonGuard.parse(response.body),
      };
    } catch (error: unknown) {
      if (error instanceof ConnectorError) {
        throw error;
      }

      if (error instanceof HTTPError) {
        const result = feishuErrorResponse.safeParse(error.response.body);

        assert(
          result.success,
          new ConnectorError(
            ConnectorErrorCodes.InvalidResponse,
            JSON.stringify(error.response.body)
          )
        );

        throw new ConnectorError(
          ConnectorErrorCodes.SocialAccessTokenInvalid,
          result.data.error_description
        );
      }

      throw new ConnectorError(ConnectorErrorCodes.General, {
        errorDescription: 'Failed to get user info',
      });
    }
  };
}

const createFeishuConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    platform: ConnectorPlatform.Web,
    configGuard: feishuConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createFeishuConnector;
