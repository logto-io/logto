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
  codeDataGuard,
} from '@logto/connector-types';
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
} from './constant';
import { alipayConfigGuard, AlipayConfig, AccessTokenResponse, UserInfoResponse } from './types';
import { signingParameters } from './utils';

export type { AlipayConfig } from './types';

type CodePayload = {
  auth_code: string;
};

const parseCodeFromJson = (json: string): string => {
  try {
    const { auth_code } = JSON.parse(json) as CodePayload;

    return auth_code;
  } catch {
    return json;
  }
};

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
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      version: '1.0',
      grant_type: 'authorization_code',
      code: parseCodeFromJson(code),
      charset: 'UTF8',
      ...config,
    };
    const signedSearchParameters = this.signingParameters(initSearchParameters);

    const response = await got
      .post(alipayEndpoint, {
        searchParams: signedSearchParameters,
        timeout: defaultTimeout,
      })
      .json<AccessTokenResponse>();

    const { msg, sub_msg } = response.error_response ?? {};
    assert(
      response.alipay_system_oauth_token_response,
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, msg ?? sub_msg)
    );
    const { access_token: accessToken } = response.alipay_system_oauth_token_response;

    assert(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

    return { accessToken };
  };

  public getUserInfo: GetUserInfo = async (data) => {
    const { code } = codeDataGuard.parse(data);
    const config = await this.getConfig(this.metadata.id);
    const { accessToken } = await this.getAccessToken(code, config);

    assert(
      accessToken && config,
      new ConnectorError(ConnectorErrorCodes.InsufficientRequestParameters)
    );

    const initSearchParameters = {
      method: methodForUserInfo,
      format: 'JSON',
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      version: '1.0',
      grant_type: 'authorization_code',
      auth_token: accessToken,
      biz_content: JSON.stringify({}),
      charset: 'UTF8',
      ...config,
    };
    const signedSearchParameters = this.signingParameters(initSearchParameters);

    const response = await got
      .post(alipayEndpoint, {
        searchParams: signedSearchParameters,
        timeout: defaultTimeout,
      })
      .json<UserInfoResponse>();

    const {
      user_id: id,
      avatar,
      nick_name: name,
      sub_msg,
      sub_code,
      msg,
      code: responseCode,
    } = response.alipay_user_info_share_response;

    if (sub_msg || sub_code) {
      if (responseCode === '20001') {
        throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid, msg);
      }
      throw new ConnectorError(ConnectorErrorCodes.General);
    }
    // TODO: elaborate on the error messages for all social connectors (see LOG-2157)

    assert(id, new ConnectorError(ConnectorErrorCodes.InvalidResponse));

    return { id, avatar, name };
  };
}
