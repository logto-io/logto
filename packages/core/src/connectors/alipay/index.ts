/**
 * The Implementation of OpenID Connect of Alipay Web Open Platform.
 * https://opendocs.alipay.com/support/01rg6h
 * https://opendocs.alipay.com/open/263/105808
 * https://opendocs.alipay.com/open/01emu5
 */
import * as crypto from 'crypto';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

import got from 'got';
import * as iconv from 'iconv-lite';
import { stringify } from 'query-string';
import snakeCaseKeys from 'snakecase-keys';

import assertThat from '@/utils/assert-that';

import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorMetadata,
  ConnectorType,
  GetAccessToken,
  GetAuthorizationUri,
  GetUserInfo,
  ValidateConfig,
} from '../types';
import { getConnectorConfig, getConnectorRequestTimeout, getFormattedDate } from '../utilities';
import {
  alipayEndpoint,
  authorizationEndpoint,
  methodForAccessToken,
  methodForUserInfo,
  scope,
  alipaySigningAlgorithmMapping,
} from './constant';
import { alipayConfigGuard, AlipayConfig, AccessTokenResponse, UserInfoResponse } from './types';

// eslint-disable-next-line unicorn/prefer-module
const currentPath = __dirname;
const pathToReadmeFile = path.join(currentPath, 'README.md');
const pathToConfigTemplate = path.join(currentPath, 'config-template.md');
const readmeContentFallback = 'Please check README.md file directory.';
const configTemplateFallback = 'Please check config-template.md file directory.';

export const metadata: ConnectorMetadata = {
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
  readme: existsSync(pathToReadmeFile)
    ? readFileSync(pathToReadmeFile, 'utf8')
    : readmeContentFallback,
  configTemplate: existsSync(pathToConfigTemplate)
    ? readFileSync(pathToConfigTemplate, 'utf-8')
    : configTemplateFallback,
};

export const validateConfig: ValidateConfig = async (config: unknown) => {
  const result = alipayConfigGuard.safeParse(config);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
  }
};

// Reference: https://github.com/alipay/alipay-sdk-nodejs-all/blob/10d78e0adc7f310d5b07567ce7e4c13a3f6c768f/lib/util.ts
export const signingPamameters = (
  parameters: AlipayConfig & Record<string, string>
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

export const getAuthorizationUri: GetAuthorizationUri = async (redirectUri, state) => {
  const { appId: app_id } = await getConnectorConfig<AlipayConfig>(metadata.id);

  const redirect_uri = encodeURI(redirectUri);

  return `${authorizationEndpoint}?${stringify({
    app_id,
    redirect_uri, // The variable `redirectUri` should match {appId, appSecret}
    scope,
    state,
  })}`;
};

export const getAccessToken: GetAccessToken = async (authCode) => {
  const config = await getConnectorConfig<AlipayConfig>(metadata.id);
  const initSearchParameters = {
    method: methodForAccessToken,
    format: 'JSON',
    timestamp: getFormattedDate(),
    version: '1.0',
    grant_type: 'authorization_code',
    code: authCode,
    charset: 'UTF8',
    ...config,
  };
  const signedSearchParameters = signingPamameters(initSearchParameters);

  const response = await got
    .post(alipayEndpoint, {
      searchParams: signedSearchParameters,
      timeout: await getConnectorRequestTimeout(),
    })
    .json<AccessTokenResponse>();

  const { msg, sub_msg } = response.error_response ?? {};
  assertThat(
    response.alipay_system_oauth_token_response,
    new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, msg ?? sub_msg)
  );
  const { access_token: accessToken } = response.alipay_system_oauth_token_response;

  assertThat(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

  return { accessToken };
};

export const getUserInfo: GetUserInfo = async (accessTokenObject) => {
  const { accessToken } = accessTokenObject;

  const config = await getConnectorConfig<AlipayConfig>(metadata.id);
  const initSearchParameters = {
    method: methodForUserInfo,
    format: 'JSON',
    timestamp: getFormattedDate(),
    version: '1.0',
    grant_type: 'authorization_code',
    auth_token: accessToken,
    biz_content: JSON.stringify({}),
    charset: 'UTF8',
    ...config,
  };
  const signedSearchParameters = signingPamameters(initSearchParameters);

  const response = await got
    .post(alipayEndpoint, {
      searchParams: signedSearchParameters,
      timeout: await getConnectorRequestTimeout(),
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

  assertThat(id, new ConnectorError(ConnectorErrorCodes.InvalidResponse));

  return { id, avatar, name };
};
