/**
 * The Implementation of OpenID Connect of Alipay Web Open Platform.
 * https://opendocs.alipay.com/support/01rg6h
 * https://opendocs.alipay.com/open/263/105808
 * https://opendocs.alipay.com/open/01emu5
 */

import {
  AuthResponseParser,
  ConnectorError,
  ConnectorErrorCodes,
  GetAuthorizationUri,
  GetConnectorConfig,
  GetUserInfo,
  LogtoConnector,
  ValidateConfig,
} from '@logto/connector-schemas';
import { assert } from '@silverhand/essentials';
import dayjs from 'dayjs';
import got from 'got';

import {
  alipayEndpoint,
  authorizationEndpoint,
  methodForAccessToken,
  methodForUserInfo,
  scope,
  defaultMetadata,
  defaultTimeout,
  timestampFormat,
  fallbackCharset,
  invalidAccessTokenCode,
  invalidAccessTokenSubCode,
} from './constant';
import {
  accessTokenResponseGuard,
  alipayConfigGuard,
  authResponseGuard,
  AlipayConfig,
  AuthResponse,
  userInfoResponseGuard,
  ErrorHandler,
} from './types';
import { signingParameters } from './utils';

export type { AlipayConfig } from './types';
export { defaultMetadata } from './constant';

export default class AlipayConnector extends LogtoConnector<AlipayConfig> {
  private readonly signingParameters = signingParameters;

  constructor(getConnectorConfig: GetConnectorConfig) {
    super(getConnectorConfig);
    this.metadata = defaultMetadata;
  }

  public validateConfig: ValidateConfig<AlipayConfig> = (config: unknown) => {
    const result = alipayConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }
  };

  public getAuthorizationUri: GetAuthorizationUri = async ({ state, redirectUri }) => {
    const config = await this.getConfig(this.metadata.id);

    this.validateConfig(config);

    const { appId: app_id } = config;

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
    const { charset, ...rest } = config;
    const initSearchParameters = {
      method: methodForAccessToken,
      format: 'JSON',
      timestamp: dayjs().format(timestampFormat),
      version: '1.0',
      grant_type: 'authorization_code',
      code,
      ...rest,
      charset: charset ?? fallbackCharset,
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
    const { auth_code } = await this.authResponseParser(data);
    const config = await this.getConfig(this.metadata.id);

    this.validateConfig(config);

    const { accessToken } = await this.getAccessToken(auth_code, config);

    assert(
      accessToken && config,
      new ConnectorError(ConnectorErrorCodes.InsufficientRequestParameters)
    );

    const { charset, ...rest } = config;
    const initSearchParameters = {
      method: methodForUserInfo,
      format: 'JSON',
      timestamp: dayjs().format(timestampFormat),
      version: '1.0',
      grant_type: 'authorization_code',
      auth_token: accessToken,
      biz_content: JSON.stringify({}),
      ...rest,
      charset: charset ?? fallbackCharset,
    };
    const signedSearchParameters = this.signingParameters(initSearchParameters);

    const httpResponse = await got.post(alipayEndpoint, {
      searchParams: signedSearchParameters,
      timeout: defaultTimeout,
    });

    const { body: rawBody } = httpResponse;

    const result = userInfoResponseGuard.safeParse(JSON.parse(rawBody));

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

  protected readonly authResponseParser: AuthResponseParser<AuthResponse> = async (
    parameterObject: unknown
  ) => {
    const result = authResponseGuard.safeParse(parameterObject);

    if (!result.success) {
      throw new ConnectorError(
        ConnectorErrorCodes.InvalidResponse,
        JSON.stringify(parameterObject)
      );
    }

    return result.data;
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
}
