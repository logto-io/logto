/**
 * The Implementation of OpenID Connect of WeChat Web Open Platform.
 * https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html
 */

import { assert } from '@silverhand/essentials';
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
  connectorDataParser,
} from '@logto/connector-kit';

import {
  authorizationEndpoint,
  accessTokenEndpoint,
  userInfoEndpoint,
  scope as defaultScope,
  defaultMetadata,
  defaultTimeout,
  invalidAccessTokenErrcode,
  invalidAuthCodeErrcode,
} from './constant.js';
import type {
  GetAccessTokenErrorHandler,
  UserInfoResponseMessageParser,
  WechatConfig,
  AccessTokenResponse,
  UserInfoResponse,
  AuthResponse,
} from './types.js';
import {
  wechatConfigGuard,
  accessTokenResponseGuard,
  userInfoResponseGuard,
  authResponseGuard,
} from './types.js';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri }) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig<WechatConfig>(config, wechatConfigGuard);

    const { appId, scope } = config;

    const queryParameters = new URLSearchParams({
      appid: appId,
      redirect_uri: encodeURI(redirectUri), // The variable `redirectUri` should match {appId, appSecret}
      response_type: 'code',
      scope: scope ?? defaultScope,
      state,
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

export const getAccessToken = async (
  code: string,
  config: WechatConfig
): Promise<{ accessToken: string; openid: string }> => {
  const { appId: appid, appSecret: secret } = config;

  const httpResponse = await got.get(accessTokenEndpoint, {
    searchParams: { appid, secret, code, grant_type: 'authorization_code' },
    timeout: { request: defaultTimeout },
  });

  const parsedBody = parseJson(httpResponse.body);
  const accessTokenResponse = connectorDataParser<AccessTokenResponse>(
    parsedBody,
    accessTokenResponseGuard
  );

  const { access_token: accessToken, openid } = accessTokenResponse;

  getAccessTokenErrorHandler(accessTokenResponse);
  assert(
    accessToken && openid,
    new ConnectorError(ConnectorErrorCodes.InvalidResponse, {
      data: { accessToken, openid },
      message: 'Access token or openid is missing.',
    })
  );

  return { accessToken, openid };
};

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data) => {
    const { code } = connectorDataParser<AuthResponse>(
      data,
      authResponseGuard,
      ConnectorErrorCodes.General
    );
    const config = await getConfig(defaultMetadata.id);
    validateConfig<WechatConfig>(config, wechatConfigGuard);
    const { accessToken, openid } = await getAccessToken(code, config);

    try {
      const httpResponse = await got.get(userInfoEndpoint, {
        searchParams: { access_token: accessToken, openid },
        timeout: { request: defaultTimeout },
      });

      const parsedBody = parseJson(httpResponse.body);
      const userInfoResponse = connectorDataParser<UserInfoResponse>(
        parsedBody,
        userInfoResponseGuard
      );

      const { unionid, headimgurl, nickname } = userInfoResponse;

      // Response properties of user info can be separated into two groups: (1) {unionid, headimgurl, nickname}, (2) {errcode, errmsg}.
      // These two groups are mutually exclusive: if group (1) is not empty, group (2) should be empty and vice versa.
      // 'errmsg' and 'errcode' turn to non-empty values or empty values at the same time. Hence, if 'errmsg' is non-empty then 'errcode' should be non-empty.
      userInfoResponseMessageParser(userInfoResponse);

      return { id: unionid ?? openid, avatar: headimgurl, name: nickname };
    } catch (error: unknown) {
      return getUserInfoErrorHandler(error);
    }
  };

// See https://developers.weixin.qq.com/doc/oplatform/Return_codes/Return_code_descriptions_new.html
const getAccessTokenErrorHandler: GetAccessTokenErrorHandler = (accessToken) => {
  const { errcode } = accessToken;

  if (errcode) {
    throw new ConnectorError(
      invalidAuthCodeErrcode.includes(errcode)
        ? ConnectorErrorCodes.SocialAuthCodeInvalid
        : ConnectorErrorCodes.General,
      { data: accessToken }
    );
  }
};

const userInfoResponseMessageParser: UserInfoResponseMessageParser = (userInfo) => {
  const { errcode } = userInfo;

  if (errcode) {
    throw new ConnectorError(
      invalidAccessTokenErrcode.includes(errcode)
        ? ConnectorErrorCodes.SocialAccessTokenInvalid
        : ConnectorErrorCodes.General,
      { data: userInfo }
    );
  }
};

const getUserInfoErrorHandler = (error: unknown) => {
  if (error instanceof HTTPError) {
    const { statusCode } = error.response;

    throw new ConnectorError(
      statusCode === 401
        ? ConnectorErrorCodes.SocialAccessTokenInvalid
        : ConnectorErrorCodes.General,
      { data: error.response }
    );
  }

  throw error;
};

const createWechatConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: wechatConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createWechatConnector;
