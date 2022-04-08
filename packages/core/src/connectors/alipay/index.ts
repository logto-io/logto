/**
 * The Implementation of OpenID Connect of Alipay Web Open Platform.
 * https://opendocs.alipay.com/support/01rg6h
 * https://opendocs.alipay.com/open/263/105808
 * https://opendocs.alipay.com/open/01emu5
 */
import * as crypto from 'crypto';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

import got, { RequestError as GotRequestError } from 'got';
import * as iconv from 'iconv-lite';
import { stringify } from 'query-string';
import snakeCaseKeys from 'snakecase-keys';
import { z } from 'zod';

import assertThat from '@/utils/assert-that';
import { redirectUriRegEx } from '@/utils/regex';

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
} from './constant';

const ALIPAY_ALGORITHM_MAPPING = {
  RSA: 'RSA-SHA1',
  RSA2: 'RSA-SHA256',
};

export enum CHAR_SET {
  UTF8 = 'UTF8',
}

// eslint-disable-next-line unicorn/prefer-module
const pathToReadmeFile = path.join(__dirname, 'README.md');
const readmeContentFallback = 'Please check README.md file directory.';
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
};

const alipayConfigGuard = z.object({
  appId: z.string(),
  charset: z.nativeEnum(CHAR_SET).default(CHAR_SET.UTF8),
  privateKey: z.string(),
  signType: z.enum(['RSA', 'RSA2']),
});

export type AlipayConfig = z.infer<typeof alipayConfigGuard>;

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
  const { biz_content: bizContent, privateKey, ...signParameters } = parameters;

  if (bizContent) {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    signParameters.biz_content = JSON.stringify(snakeCaseKeys(JSON.parse(bizContent)));
  }

  const decamelizeParameters = snakeCaseKeys(signParameters);

  // eslint-disable-next-line @silverhand/fp/no-mutating-methods
  const sortedParametersAsString = Object.keys(decamelizeParameters)
    .sort()
    .map((key) => {
      // eslint-disable-next-line @silverhand/fp/no-let
      let data = decamelizeParameters[key];

      if (Array.prototype.toString.call(data) !== '[object String]') {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        data = JSON.stringify(data);
      }

      // Supported Encodings can be found at https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return data ? `${key}=${iconv.encode(data, signParameters.charset)}` : '';
    })
    .filter((keyValueString) => keyValueString)
    .join('&');

  const sign = crypto
    .createSign(ALIPAY_ALGORITHM_MAPPING[signParameters.signType])
    .update(sortedParametersAsString, 'utf8')
    .sign(privateKey, 'base64');

  // eslint-disable-next-line @silverhand/fp/no-mutating-assign
  return Object.assign(decamelizeParameters, { sign });
};

export const getAuthorizationUri: GetAuthorizationUri = async (redirectUri, state) => {
  assertThat(redirectUriRegEx.test(redirectUri), 'connector.invalid_redirect_uri');
  const { appId: app_id } = await getConnectorConfig<AlipayConfig>(metadata.id);

  return `${authorizationEndpoint}?${stringify({
    app_id,
    redirect_uri: encodeURI(redirectUri), // The variable `redirectUri` should match {appId, appSecret}
    scope,
    state,
  })}`;
};

export const getAccessToken: GetAccessToken = async (authCode) => {
  type AccessTokenResponse = {
    error_response?: {
      code: string;
      msg: string; // To know `code` and `msg` details, see: https://opendocs.alipay.com/common/02km9f
      sub_code?: string;
      sub_msg?: string;
    };
    sign: string; // To know `sign` details, see: https://opendocs.alipay.com/common/02kf5q
    alipay_system_oauth_token_response?: {
      user_id: string; // Unique Alipay ID, 16 digits starts with '2088'
      access_token: string;
      expires_in: string; // In seconds
      refresh_token: string;
      re_expires_in: string; // Expiring time of refresh token, in seconds
    };
  };

  const config = await getConnectorConfig<AlipayConfig>(metadata.id);
  const initSearchParameters = {
    method: methodForAccessToken,
    format: 'JSON',
    timestamp: getFormattedDate(),
    version: '1.0',
    grant_type: 'authorization_code',
    code: authCode,
    ...config,
  };
  const signedSearchParameters = signingPamameters(initSearchParameters);

  const response = await got
    .post(alipayEndpoint, {
      searchParams: signedSearchParameters,
      timeout: await getConnectorRequestTimeout(),
    })
    .json<AccessTokenResponse>();

  assertThat(
    response.alipay_system_oauth_token_response,
    new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid)
  );
  const { access_token: accessToken } = response.alipay_system_oauth_token_response;

  assertThat(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

  return { accessToken };
};

export const getUserInfo: GetUserInfo = async (accessTokenObject) => {
  type UserInfoResponse = {
    error_response?: {
      code: string;
      msg: string; // To know `code` and `msg` details, see: https://opendocs.alipay.com/common/02km9f
      sub_code?: string;
      sub_msg?: string;
    };
    sign: string; // To know `sign` details, see: https://opendocs.alipay.com/common/02kf5q
    alipay_user_info_share_response?: {
      user_id: string; // String of digits with max length of 16
      avatar?: string; // URL of avatar
      province?: string;
      city?: string;
      nick_name?: string;
      gender?: string; // Enum type: 'F' for female, 'M' for male
    };
  };

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
    ...config,
  };
  const signedSearchParameters = signingPamameters(initSearchParameters);

  try {
    const response = await got
      .post(alipayEndpoint, {
        searchParams: signedSearchParameters,
        timeout: await getConnectorRequestTimeout(),
      })
      .json<UserInfoResponse>();

    assertThat(
      response.alipay_user_info_share_response,
      new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid)
    );
    const { user_id: id, avatar, nick_name: name } = response.alipay_user_info_share_response;

    assertThat(id, new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid));

    return { id, avatar, name };
  } catch (error: unknown) {
    if (error instanceof GotRequestError && error.response?.statusCode === 401) {
      throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
    }

    throw error;
  }
};
