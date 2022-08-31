/**
 * The Implementation of OpenID Connect of WeChat Web Open Platform.
 * https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html
 */

import {
  GetAuthorizationUri,
  GetUserInfo,
  ConnectorError,
  ConnectorErrorCodes,
  GetConnectorConfig,
  validateConfig,
  CreateConnector,
  SocialConnector,
  ConnectorType,
} from '@logto/connector-core';
import { assert } from '@silverhand/essentials';
import got, { HTTPError } from 'got';

import {
  authorizationEndpoint,
  accessTokenEndpoint,
  userInfoEndpoint,
  scope,
  defaultMetadata,
  defaultTimeout,
  invalidAccessTokenErrcode,
  invalidAuthCodeErrcode,
} from './constant';
import {
  wechatConfigGuard,
  accessTokenResponseGuard,
  GetAccessTokenErrorHandler,
  userInfoResponseGuard,
  UserInfoResponseMessageParser,
  WechatConfig,
  authResponseGuard,
} from './types';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri }) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig<WechatConfig>(config, wechatConfigGuard);

    const { appId } = config;

    const queryParameters = new URLSearchParams({
      appid: appId,
      redirect_uri: encodeURI(redirectUri), // The variable `redirectUri` should match {appId, appSecret}
      response_type: 'code',
      scope,
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
    timeout: defaultTimeout,
  });

  const result = accessTokenResponseGuard.safeParse(JSON.parse(httpResponse.body));

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
  }

  const { access_token: accessToken, openid } = result.data;

  getAccessTokenErrorHandler(result.data);

  assert(accessToken && openid, new ConnectorError(ConnectorErrorCodes.InvalidResponse));

  return { accessToken, openid };
};

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data) => {
    const { code } = await authorizationCallbackHandler(data);
    const config = await getConfig(defaultMetadata.id);
    validateConfig<WechatConfig>(config, wechatConfigGuard);
    const { accessToken, openid } = await getAccessToken(code, config);

    try {
      const httpResponse = await got.get(userInfoEndpoint, {
        searchParams: { access_token: accessToken, openid },
        timeout: defaultTimeout,
      });

      const result = userInfoResponseGuard.safeParse(JSON.parse(httpResponse.body));

      if (!result.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
      }

      const { unionid, headimgurl, nickname } = result.data;

      // Response properties of user info can be separated into two groups: (1) {unionid, headimgurl, nickname}, (2) {errcode, errmsg}.
      // These two groups are mutually exclusive: if group (1) is not empty, group (2) should be empty and vice versa.
      // 'errmsg' and 'errcode' turn to non-empty values or empty values at the same time. Hence, if 'errmsg' is non-empty then 'errcode' should be non-empty.
      userInfoResponseMessageParser(result.data);

      return { id: unionid ?? openid, avatar: headimgurl, name: nickname };
    } catch (error: unknown) {
      return getUserInfoErrorHandler(error);
    }
  };

// See https://developers.weixin.qq.com/doc/oplatform/Return_codes/Return_code_descriptions_new.html
const getAccessTokenErrorHandler: GetAccessTokenErrorHandler = (accessToken) => {
  const { errcode, errmsg } = accessToken;

  if (errcode) {
    assert(
      !invalidAuthCodeErrcode.includes(errcode),
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, errmsg)
    );

    throw new ConnectorError(ConnectorErrorCodes.General, { errorDescription: errmsg, errcode });
  }
};

const userInfoResponseMessageParser: UserInfoResponseMessageParser = (userInfo) => {
  const { errcode, errmsg } = userInfo;

  if (errcode) {
    assert(
      !invalidAccessTokenErrcode.includes(errcode),
      new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid, errmsg)
    );

    throw new ConnectorError(ConnectorErrorCodes.General, { errorDescription: errmsg, errcode });
  }
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

const authorizationCallbackHandler = async (parameterObject: unknown) => {
  const result = authResponseGuard.safeParse(parameterObject);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(parameterObject));
  }

  return result.data;
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
