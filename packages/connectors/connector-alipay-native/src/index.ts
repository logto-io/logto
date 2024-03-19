/**
 * The Implementation of OpenID Connect of Alipay Web Open Platform.
 * https://opendocs.alipay.com/open/218/105325
 * https://opendocs.alipay.com/open/218/105327
 *
 * https://opendocs.alipay.com/open/204/105295/
 * https://opendocs.alipay.com/open/204/105296/
 */

import { assert } from '@silverhand/essentials';
import { got } from 'got';
import { z } from 'zod';

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
import dayjs from 'dayjs';

import {
  alipayEndpoint,
  authorizationEndpoint,
  methodForAccessToken,
  methodForUserInfo,
  defaultMetadata,
  defaultTimeout,
  timestampFormat,
  invalidAccessTokenCode,
  invalidAccessTokenSubCode,
} from './constant.js';
import type { AlipayNativeConfig, ErrorHandler } from './types.js';
import {
  alipayNativeConfigGuard,
  accessTokenResponseGuard,
  userInfoResponseGuard,
} from './types.js';
import { signingParameters } from './utils.js';

export type { AlipayNativeConfig } from './types.js';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state }) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, alipayNativeConfigGuard);

    const { appId } = config;

    const queryParameters = new URLSearchParams({ app_id: appId, state });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

export const getAccessToken = async (code: string, config: AlipayNativeConfig) => {
  const initSearchParameters = {
    method: methodForAccessToken,
    format: 'JSON',
    timestamp: dayjs().format(timestampFormat),
    version: '1.0',
    grant_type: 'authorization_code',
    code,
    charset: 'utf8',
    ...config,
  };
  const signedSearchParameters = signingParameters(initSearchParameters);

  const httpResponse = await got.post(alipayEndpoint, {
    searchParams: signedSearchParameters,
    timeout: { request: defaultTimeout },
  });

  const result = accessTokenResponseGuard.safeParse(parseJson(httpResponse.body));

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
  }

  const { error_response, alipay_system_oauth_token_response } = result.data;

  const { msg, sub_msg } = error_response ?? {};

  assert(
    alipay_system_oauth_token_response,
    new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, msg ?? sub_msg)
  );
  const { access_token: accessToken } = alipay_system_oauth_token_response;
  assert(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

  return { accessToken };
};

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data) => {
    const { auth_code } = await authorizationCallbackHandler(data);
    const config = await getConfig(defaultMetadata.id);

    validateConfig(config, alipayNativeConfigGuard);

    const { accessToken } = await getAccessToken(auth_code, config);

    assert(
      accessToken && config,
      new ConnectorError(ConnectorErrorCodes.InsufficientRequestParameters)
    );

    const initSearchParameters = {
      method: methodForUserInfo,
      format: 'JSON',
      timestamp: dayjs().format(timestampFormat),
      version: '1.0',
      grant_type: 'authorization_code',
      auth_token: accessToken,
      biz_content: JSON.stringify({}),
      charset: 'utf8',
      ...config,
    };
    const signedSearchParameters = signingParameters(initSearchParameters);

    const httpResponse = await got.post(alipayEndpoint, {
      searchParams: signedSearchParameters,
      timeout: { request: defaultTimeout },
    });
    const rawData = parseJson(httpResponse.body);
    const result = userInfoResponseGuard.safeParse(rawData);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
    }

    const { alipay_user_info_share_response } = result.data;

    errorHandler(alipay_user_info_share_response);

    const { user_id: id, avatar, nick_name: name } = alipay_user_info_share_response;

    if (!id) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse);
    }

    return { id, avatar, name, rawData };
  };

const errorHandler: ErrorHandler = ({ code, msg, sub_code, sub_msg }) => {
  if (invalidAccessTokenCode.includes(code)) {
    throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid, msg);
  }

  if (sub_code) {
    assert(
      !invalidAccessTokenSubCode.includes(sub_code),
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, msg)
    );

    throw new ConnectorError(ConnectorErrorCodes.General, {
      errorDescription: msg,
      code,
      sub_code,
      sub_msg,
    });
  }
};

const authorizationCallbackHandler = async (parameterObject: unknown) => {
  const dataGuard = z.object({ auth_code: z.string() });

  const result = dataGuard.safeParse(parameterObject);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(parameterObject));
  }

  return result.data;
};

const createAlipayNativeConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: alipayNativeConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createAlipayNativeConnector;
