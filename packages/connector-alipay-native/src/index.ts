// FIXME: @Darcy
/* eslint-disable unicorn/text-encoding-identifier-case */
/**
 * The Implementation of OpenID Connect of Alipay Web Open Platform.
 * https://opendocs.alipay.com/open/218/105325
 * https://opendocs.alipay.com/open/218/105327
 *
 * https://opendocs.alipay.com/open/204/105295/
 * https://opendocs.alipay.com/open/204/105296/
 */

import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorMetadata,
  Connector,
  GetAuthorizationUri,
  GetUserInfo,
  SocialConnectorInstance,
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
  defaultMetadata,
  defaultTimeout,
  timestampFormat,
  invalidAccessTokenCode,
  invalidAccessTokenSubCode,
} from './constant';
import {
  alipayNativeConfigGuard,
  AlipayNativeConfig,
  accessTokenResponseGuard,
  userInfoResponseGuard,
  ErrorHandler,
} from './types';
import { signingParameters } from './utils';

export type { AlipayNativeConfig } from './types';

export default class AlipayNativeConnector implements SocialConnectorInstance<AlipayNativeConfig> {
  public metadata: ConnectorMetadata = defaultMetadata;
  private _connector?: Connector;

  public get connector() {
    if (!this._connector) {
      throw new ConnectorError(ConnectorErrorCodes.General);
    }

    return this._connector;
  }

  public set connector(input: Connector) {
    this._connector = input;
  }

  private readonly signingParameters = signingParameters;

  constructor(public readonly getConfig: GetConnectorConfig) {}

  public validateConfig(config: unknown): asserts config is AlipayNativeConfig {
    const result = alipayNativeConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }
  }

  public getAuthorizationUri: GetAuthorizationUri = async ({ state }) => {
    const config = await this.getConfig(this.metadata.id);

    this.validateConfig(config);

    const { appId } = config;

    const queryParameters = new URLSearchParams({ app_id: appId, state });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

  public getAccessToken = async (code: string, config: AlipayNativeConfig) => {
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

    this.validateConfig(config);

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

    this.errorHandler(alipay_user_info_share_response);

    const { user_id: id, avatar, nick_name: name } = alipay_user_info_share_response;

    if (!id) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse);
    }

    return { id, avatar, name };
  };

  private readonly errorHandler: ErrorHandler = ({ code, msg, sub_code, sub_msg }) => {
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

  private readonly authorizationCallbackHandler = async (parameterObject: unknown) => {
    const dataGuard = z.object({ auth_code: z.string() });

    const result = dataGuard.safeParse(parameterObject);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(parameterObject));
    }

    return result.data;
  };
}
/* eslint-enable unicorn/text-encoding-identifier-case */
