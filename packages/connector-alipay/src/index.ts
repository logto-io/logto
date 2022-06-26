/**
 * The Implementation of OpenID Connect of Alipay Web Open Platform.
 * https://opendocs.alipay.com/support/01rg6h
 * https://opendocs.alipay.com/open/263/105808
 * https://opendocs.alipay.com/open/01emu5
 */

import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorMetadata,
  GetAuthorizationUri,
  GetUserInfo,
  ValidateConfig,
  SocialConnector,
  GetConnectorConfig,
} from '@logto/connector-types';
import { assert } from '@silverhand/essentials';
import dayjs from 'dayjs';
import got from 'got';
import { z } from 'zod';

import {
  alipayEndpoint,
  authorizationEndpoint,
  methodForAccessToken,
  methodForUserInfo,
  scope,
  defaultMetadata,
  defaultTimeout,
  timestampFormat,
} from './constant';
import {
  alipayConfigGuard,
  AlipayConfig,
  accessTokenResponseGuard,
  userInfoResponseGuard,
  ErrorHandler,
} from './types';
import { signingParameters } from './utils';

export type { AlipayConfig } from './types';

export default class AlipayConnector implements SocialConnector {
  public metadata: ConnectorMetadata = defaultMetadata;

  private readonly signingParameters = signingParameters;

  constructor(public readonly getConfig: GetConnectorConfig<AlipayConfig>) {}

  public validateConfig: ValidateConfig = async (config: unknown) => {
    const result = alipayConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
    }
  };

  public getAuthorizationUri: GetAuthorizationUri = async ({ state, redirectUri }) => {
    const { appId: app_id } = await this.getConfig(this.metadata.id);

    const redirect_uri = encodeURI(redirectUri);

    const queryParameters = new URLSearchParams({
      app_id,
      redirect_uri, // The variable `redirectUri` should match {appId, appSecret}
      scope,
      state,
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

  public getAccessToken = async (code: string, config: AlipayConfig) => {
    const initSearchParameters = {
      method: methodForAccessToken,
      format: 'JSON',
      timestamp: dayjs().format(timestampFormat),
      version: '1.0',
      grant_type: 'authorization_code',
      code,
      charset: 'UTF8',
      ...config,
    };
    const signedSearchParameters = this.signingParameters(initSearchParameters);

    const httpResponse = await got.post(alipayEndpoint, {
      searchParams: signedSearchParameters,
      timeout: defaultTimeout,
    });

    const result = accessTokenResponseGuard.safeParse(JSON.parse(httpResponse.body));

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
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

  public getUserInfo: GetUserInfo = async (data) => {
    const { auth_code } = await this.authorizationCallbackHandler(data);
    const config = await this.getConfig(this.metadata.id);
    const { accessToken } = await this.getAccessToken(auth_code, config);

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
      charset: 'UTF8',
      ...config,
    };
    const signedSearchParameters = this.signingParameters(initSearchParameters);

    const httpResponse = await got.post(alipayEndpoint, {
      searchParams: signedSearchParameters,
      timeout: defaultTimeout,
    });

    const result = userInfoResponseGuard.safeParse(JSON.parse(httpResponse.body));

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
    }

    const { alipay_user_info_share_response } = result.data;

    const {
      user_id: id,
      avatar,
      nick_name: name,
      code,
      msg,
      sub_code,
    } = alipay_user_info_share_response;

    this.errorHandler({ code, msg, sub_code });
    assert(id, new ConnectorError(ConnectorErrorCodes.InvalidResponse));

    return { id, avatar, name };
  };

  private readonly errorHandler: ErrorHandler = ({ code, msg, sub_code }) => {
    assert(code !== '20001', new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid, msg));
    assert(
      sub_code !== 'isv.code-invalid',
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, msg)
    );
    assert(!sub_code, new ConnectorError(ConnectorErrorCodes.General, msg));
  };

  private readonly authorizationCallbackHandler = async (parameterObject: unknown) => {
    const dataGuard = z.object({ auth_code: z.string() });

    const result = dataGuard.safeParse(parameterObject);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(parameterObject));
    }

    return result.data;
  };
}
