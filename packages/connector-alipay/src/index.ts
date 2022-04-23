/**
 * The Implementation of OpenID Connect of Alipay Web Open Platform.
 * https://opendocs.alipay.com/support/01rg6h
 * https://opendocs.alipay.com/open/263/105808
 * https://opendocs.alipay.com/open/01emu5
 */
import * as crypto from 'crypto';
import path from 'path';

import {
  AccessTokenObject,
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorMetadata,
  GetAccessToken,
  GetAuthorizationUri,
  GetUserInfo,
  ValidateConfig,
  SocialConnector,
  GetConnectorConfig,
  GetTimeout,
  GetTimestamp,
} from '@logto/connector-types';
import { ConnectorType } from '@logto/schemas';
import { getMarkdownContents } from '@logto/shared';
import { assert } from '@silverhand/essentials';
import got from 'got';
import * as iconv from 'iconv-lite';
import { stringify } from 'query-string';
import snakeCaseKeys from 'snakecase-keys';

import {
  alipayEndpoint,
  authorizationEndpoint,
  methodForAccessToken,
  methodForUserInfo,
  scope,
  alipaySigningAlgorithmMapping,
} from './constant';
import { alipayConfigGuard, AlipayConfig, AccessTokenResponse, UserInfoResponse } from './types';

export type { AlipayConfig } from './types';

// eslint-disable-next-line unicorn/prefer-module
const currentPath = __dirname;
const pathToReadmeFile = path.join(currentPath, 'README.md');
const pathToConfigTemplate = path.join(currentPath, 'config-template.md');
const readmeContentFallback = 'Please check README.md file directory.';
const configTemplateFallback = 'Please check config-template.md file directory.';

export class AlipayConnector implements SocialConnector {
  public metadata: ConnectorMetadata = {
    id: 'alipay',
    type: ConnectorType.Social,
    name: {
      en: 'Sign In with Alipay',
      'zh-CN': '支付宝登录',
    },
    // TODO: add the real logo URL (LOG-1823)
    logo: './logo.png',
    description: {
      en: 'Sign In with Alipay',
      'zh-CN': '支付宝登录',
    },
    readme: getMarkdownContents(pathToReadmeFile, readmeContentFallback),
    configTemplate: getMarkdownContents(pathToConfigTemplate, configTemplateFallback),
  };

  public readonly getConfig: GetConnectorConfig<AlipayConfig>;
  public readonly getRequestTimeout: GetTimeout;
  public readonly getTimestamp: GetTimestamp;

  constructor(
    getConnectorConfig: GetConnectorConfig<AlipayConfig>,
    getConnectorRequestTimeout: GetTimeout,
    getConnectorTimestamp: GetTimestamp
  ) {
    this.getConfig = getConnectorConfig;
    this.getRequestTimeout = getConnectorRequestTimeout;
    this.getTimestamp = getConnectorTimestamp;
  }

  public validateConfig: ValidateConfig = async (config: unknown) => {
    const result = alipayConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
    }
  };

  public getAuthorizationUri: GetAuthorizationUri = async (redirectUri, state) => {
    const { appId: app_id } = await this.getConfig(this.metadata.id);

    const redirect_uri = encodeURI(redirectUri);

    return `${authorizationEndpoint}?${stringify({
      app_id,
      redirect_uri, // The variable `redirectUri` should match {appId, appSecret}
      scope,
      state,
    })}`;
  };

  public getAccessToken: GetAccessToken = async (code): Promise<AccessTokenObject> => {
    const config = await this.getConfig(this.metadata.id);
    const initSearchParameters = {
      method: methodForAccessToken,
      format: 'JSON',
      timestamp: this.getTimestamp(),
      version: '1.0',
      grant_type: 'authorization_code',
      code,
      charset: 'UTF8',
      ...config,
    };
    const signedSearchParameters = this.signingPamameters(initSearchParameters);

    const response = await got
      .post(alipayEndpoint, {
        searchParams: signedSearchParameters,
        timeout: await this.getRequestTimeout(),
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

  public getUserInfo: GetUserInfo = async (accessTokenObject) => {
    const config = await this.getConfig(this.metadata.id);
    const { accessToken } = accessTokenObject;
    assert(
      accessToken && config,
      new ConnectorError(ConnectorErrorCodes.InsufficientRequestParameters)
    );

    const initSearchParameters = {
      method: methodForUserInfo,
      format: 'JSON',
      timestamp: this.getTimestamp(),
      version: '1.0',
      grant_type: 'authorization_code',
      auth_token: accessToken,
      biz_content: JSON.stringify({}),
      charset: 'UTF8',
      ...config,
    };
    const signedSearchParameters = this.signingPamameters(initSearchParameters);

    const response = await got
      .post(alipayEndpoint, {
        searchParams: signedSearchParameters,
        timeout: await this.getRequestTimeout(),
      })
      .json<UserInfoResponse>();

    const {
      user_id: id,
      avatar,
      nick_name: name,
      sub_msg,
      sub_code,
      msg,
      code,
    } = response.alipay_user_info_share_response;

    if (sub_msg || sub_code) {
      if (code === '20001') {
        throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid, msg);
      }
      throw new ConnectorError(ConnectorErrorCodes.General);
    }
    // TODO: elaborate on the error messages for all social connectors (see LOG-2157)

    assert(id, new ConnectorError(ConnectorErrorCodes.InvalidResponse));

    return { id, avatar, name };
  };

  // Reference: https://github.com/alipay/alipay-sdk-nodejs-all/blob/10d78e0adc7f310d5b07567ce7e4c13a3f6c768f/lib/util.ts
  public readonly signingPamameters = (
    parameters: AlipayConfig & Record<string, string | undefined>
  ): Record<string, string> => {
    const { biz_content, privateKey, ...rest } = parameters;
    const signParameters = snakeCaseKeys(
      biz_content
        ? {
            ...rest,
            bizContent: JSON.stringify(snakeCaseKeys(JSON.parse(biz_content))),
          }
        : rest
    );

    const decamelizeParameters = snakeCaseKeys(signParameters);

    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    const sortedParametersAsString = Object.entries(decamelizeParameters)
      .map(([key, value]) => {
        // Supported Encodings can be found at https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings

        if (value) {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          return `${key}=${iconv.encode(value, rest.charset ?? 'UTF8')}`;
        }

        return '';
      })
      .filter((keyValueString) => keyValueString)
      .sort()
      .join('&');

    const sign = crypto
      .createSign(alipaySigningAlgorithmMapping[rest.signType])
      .update(sortedParametersAsString, 'utf8')
      .sign(privateKey, 'base64');

    return { ...decamelizeParameters, sign };
  };
}
