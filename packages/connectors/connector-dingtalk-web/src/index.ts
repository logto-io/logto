/**
 * DingTalk OAuth2 Connector
 * https://open.dingtalk.com/document/orgapp/obtain-identity-credentials#title-4up-u8w-5ug
 */

import { got, HTTPError } from 'got';

import type {
  GetAuthorizationUri,
  GetUserInfo,
  GetConnectorConfig,
  CreateConnector,
  SocialConnector,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
  parseJson,
} from '@logto/connector-kit';

import {
  authorizationEndpoint,
  accessTokenEndpoint,
  userInfoEndpoint,
  scope as defaultScope,
  defaultMetadata,
  defaultTimeout,
} from './constant.js';
import type { DingtalkConfig } from './types.js';
import {
  dingtalkConfigGuard,
  accessTokenResponseGuard,
  userInfoResponseGuard,
  authResponseGuard,
} from './types.js';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri }) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, dingtalkConfigGuard);

    const { clientId, scope } = config;

    const queryParameters = new URLSearchParams({
      client_id: clientId,
      redirect_uri: encodeURI(redirectUri), // The variable `redirectUri` should match {clientId, clientSecret}
      response_type: 'code',
      scope: scope ?? defaultScope,
      state,
      prompt: 'consent',
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

export const getAccessToken = async (
  code: string,
  config: DingtalkConfig
): Promise<{ accessToken: string }> => {
  const { clientId, clientSecret } = config;

  const httpResponse = await got.post(accessTokenEndpoint, {
    json: {
      clientId,
      clientSecret,
      code,
      grantType: 'authorization_code',
    },
    timeout: { request: defaultTimeout },
  });

  const result = accessTokenResponseGuard.safeParse(parseJson(httpResponse.body));

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
  }

  const { accessToken } = result.data;

  return { accessToken };
};

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data) => {
    const { code } = await authorizationCallbackHandler(data);
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, dingtalkConfigGuard);
    const { accessToken } = await getAccessToken(code, config);

    try {
      const httpResponse = await got.get(userInfoEndpoint, {
        headers: {
          'x-acs-dingtalk-access-token': accessToken,
        },
        timeout: { request: defaultTimeout },
      });
      const rawData = parseJson(httpResponse.body);
      const result = userInfoResponseGuard.safeParse(rawData);

      if (!result.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
      }

      const { nick: name, avatarUrl: avatar, unionId: id, email, mobile, stateCode } = result.data;
      return {
        id,
        avatar,
        phone: stateCode && mobile ? `${stateCode}${mobile}` : undefined,
        email,
        name,
        rawData,
      };
    } catch (error: unknown) {
      return getUserInfoErrorHandler(error);
    }
  };

const getUserInfoErrorHandler = (error: unknown) => {
  // https://open.dingtalk.com/document/personalapp/error-code-2#title-m5s-krt-vds
  if (error instanceof HTTPError) {
    const { statusCode, body: rawBody } = error.response;

    if (statusCode === 400) {
      throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
    }

    throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(rawBody));
  }

  throw error;
};

const authorizationCallbackHandler = async (parameterObject: unknown) => {
  const result = authResponseGuard.safeParse(parameterObject);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(parameterObject));
  }

  return result.data;
};

const createDingtalkConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: dingtalkConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createDingtalkConnector;
