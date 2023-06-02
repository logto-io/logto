/**
 * The Implementation of OpenID Connect of Alipay Web Open Platform.
 * https://opendocs.alipay.com/support/01rg6h
 * https://opendocs.alipay.com/open/263/105808
 * https://opendocs.alipay.com/open/01emu5
 */

import { assert } from '@silverhand/essentials';
import { got } from 'got';
import { z } from 'zod';

import type {
  GetConnectorConfig,
  GetAuthorizationUri,
  GetUserInfo,
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
import dayjs from 'dayjs';

import {
  alipayEndpoint,
  authorizationEndpoint,
  methodForAccessToken,
  methodForUserInfo,
  scope as defaultScope,
  defaultMetadata,
  defaultTimeout,
  timestampFormat,
  invalidAccessTokenCode,
  invalidAccessTokenSubCode,
} from './constant.js';
import type { AlipayConfig, ErrorHandler, AccessTokenResponse, UserInfoResponse } from './types.js';
import { alipayConfigGuard, accessTokenResponseGuard, userInfoResponseGuard } from './types.js';
import { signingParameters } from './utils.js';

export type { AlipayConfig } from './types.js';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri }) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig<AlipayConfig>(config, alipayConfigGuard);

    const { appId: app_id, scope } = config;

    const redirect_uri = encodeURI(redirectUri);

    const queryParameters = new URLSearchParams({
      app_id,
      redirect_uri, // The variable `redirectUri` should match {appId, appSecret}
      scope: scope ?? defaultScope,
      state,
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

export const getAccessToken = async (code: string, config: AlipayConfig) => {
  const initSearchParameters = {
    method: methodForAccessToken,
    format: 'JSON',
    timestamp: dayjs().format(timestampFormat),
    version: '1.0',
    grant_type: 'authorization_code',
    code,
    ...config,
  };
  const signedSearchParameters = signingParameters(initSearchParameters);

  const httpResponse = await got.post(alipayEndpoint, {
    searchParams: signedSearchParameters,
    timeout: { request: defaultTimeout },
  });

  const parsedBody = parseJson(httpResponse.body);
  const { error_response, alipay_system_oauth_token_response } =
    connectorDataParser<AccessTokenResponse>(parsedBody, accessTokenResponseGuard);

  assert(
    alipay_system_oauth_token_response,
    new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, { data: error_response })
  );
  const { access_token: accessToken } = alipay_system_oauth_token_response;
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
    const { auth_code } = connectorDataParser(data, z.object({ auth_code: z.string() }));
    const config = await getConfig(defaultMetadata.id);
    validateConfig<AlipayConfig>(config, alipayConfigGuard);

    const { accessToken } = await getAccessToken(auth_code, config);

    assert(
      accessToken && config,
      new ConnectorError(ConnectorErrorCodes.InsufficientRequestParameters, {
        message: 'access token or config is missing.',
      })
    );

    const initSearchParameters = {
      method: methodForUserInfo,
      format: 'JSON',
      timestamp: dayjs().format(timestampFormat),
      version: '1.0',
      grant_type: 'authorization_code',
      auth_token: accessToken,
      biz_content: JSON.stringify({}),
      ...config,
    };
    const signedSearchParameters = signingParameters(initSearchParameters);

    const httpResponse = await got.post(alipayEndpoint, {
      searchParams: signedSearchParameters,
      timeout: { request: defaultTimeout },
    });

    const { body: rawBody } = httpResponse;

    const parsedBody = parseJson(rawBody);
    const { alipay_user_info_share_response } = connectorDataParser<UserInfoResponse>(
      parsedBody,
      userInfoResponseGuard
    );

    errorHandler(alipay_user_info_share_response);

    const { user_id: id, avatar, nick_name: name } = alipay_user_info_share_response;

    if (!id) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, {
        message: 'user id is missing.',
      });
    }

    return { id, avatar, name };
  };

const errorHandler: ErrorHandler = ({ code, msg, sub_code, sub_msg }) => {
  const payload = { code, msg, sub_code, sub_msg };
  if (invalidAccessTokenCode.includes(code)) {
    throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid, { data: payload });
  }

  if (sub_code) {
    assert(
      !invalidAccessTokenSubCode.includes(sub_code),
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, { data: payload })
    );

    throw new ConnectorError(ConnectorErrorCodes.General, { data: payload });
  }
};

const createAlipayConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: alipayConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createAlipayConnector;
