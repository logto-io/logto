import { conditional } from '@silverhand/essentials';
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
  validateConfig,
  connectorDataParser,
} from '@logto/connector-kit';

import {
  accessTokenEndpoint,
  codeEndpoint,
  defaultMetadata,
  userInfoEndpoint,
} from './constant.js';
import type {
  FeishuConfig,
  FeishuAuthCode,
  FeishuAccessTokenResponse,
  FeishuErrorResponse,
  FeishuUserInfoResponse,
} from './types.js';
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
    validateConfig<FeishuConfig>(config, feishuConfigGuard);

    const { appId } = config;

    return buildAuthorizationUri(appId, redirectUri, state);
  };
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

    const { access_token: accessToken } = connectorDataParser<FeishuAccessTokenResponse>(
      response.body,
      feishuAccessTokenResponse
    );

    if (accessToken.length === 0) {
      throw new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, {
        message: 'access_token is empty',
      });
    }

    return { accessToken };
  } catch (error: unknown) {
    if (error instanceof ConnectorError) {
      throw error;
    }

    if (error instanceof HTTPError) {
      const errorResponse = connectorDataParser<FeishuErrorResponse>(
        error.response.body,
        feishuErrorResponse
      );
      throw new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, { data: errorResponse });
    }

    throw new ConnectorError(ConnectorErrorCodes.General, {
      message: 'Failed to get access token',
    });
  }
}

export function getUserInfo(getConfig: GetConnectorConfig): GetUserInfo {
  return async function (data) {
    const { code, redirectUri } = connectorDataParser<FeishuAuthCode>(data, feishuAuthCodeGuard);
    const config = await getConfig(defaultMetadata.id);
    validateConfig<FeishuConfig>(config, feishuConfigGuard);

    const { accessToken } = await getAccessToken(code, config.appId, config.appSecret, redirectUri);

    try {
      const response = await got.get(userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'json',
      });

      const {
        sub,
        user_id,
        name,
        email,
        avatar_url: avatar,
        mobile,
      } = connectorDataParser<FeishuUserInfoResponse>(response.body, feishuUserInfoResponse);

      return {
        id: sub,
        name,
        avatar,
        email: conditional(email),
        userId: conditional(user_id),
        phone: conditional(mobile),
      };
    } catch (error: unknown) {
      if (error instanceof ConnectorError) {
        throw error;
      }

      if (error instanceof HTTPError) {
        const errorResponse = connectorDataParser<FeishuErrorResponse>(
          error.response.body,
          feishuErrorResponse
        );
        throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid, {
          data: errorResponse,
        });
      }

      throw new ConnectorError(ConnectorErrorCodes.General, {
        message: 'Failed to get user info',
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
