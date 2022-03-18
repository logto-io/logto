/**
 * The Implementation of OpenID Connect of WeChat Web Open Platform.
 * https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html
 */
import { existsSync, readFileSync } from 'fs';
import path from 'path';

import got, { RequestError as GotRequestError } from 'got';
import { stringify } from 'query-string';
import { z } from 'zod';

import assertThat from '@/utils/assert-that';

import {
  ConnectorMetadata,
  GetAccessToken,
  GetAuthorizationUri,
  ValidateConfig,
  GetUserInfo,
  ConnectorType,
  ConnectorError,
  ConnectorErrorCodes,
} from '../types';
import { getConnectorConfig, getConnectorRequestTimeout } from '../utilities';
import { authorizationEndpoint, accessTokenEndpoint, userInfoEndpoint, scope } from './constant';

// eslint-disable-next-line unicorn/prefer-module
const pathToReadmeFile = path.join(__dirname, 'README.md');
const readmeContentFallback = 'Please check README.md file directory.';
export const metadata: ConnectorMetadata = {
  id: 'wechat',
  type: ConnectorType.Social,
  name: {
    en: 'Sign In with WeChat',
    'zh-CN': '微信登录',
  },
  // TODO: add the real logo URL (LOG-1823)
  logo: './logo.png',
  description: {
    en: 'Sign In with WeChat',
    'zh-CN': '微信登录',
  },
  readme: existsSync(pathToReadmeFile)
    ? readFileSync(pathToReadmeFile, 'utf8')
    : readmeContentFallback,
};

// As creating a WeChat Web/Mobile application needs a real App or Website record, the real test is temporarily not finished.
// TODO: test with our own wechat mobile/web application (LOG-1910), already tested with other verified wechat web application

const weChatConfigGuard = z.object({ appId: z.string(), appSecret: z.string() });

type WeChatConfig = z.infer<typeof weChatConfigGuard>;

export const validateConfig: ValidateConfig = async (config: unknown) => {
  const result = weChatConfigGuard.safeParse(config);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
  }
};

export const getAuthorizationUri: GetAuthorizationUri = async (redirectUri, state) => {
  const { appId } = await getConnectorConfig<WeChatConfig>(metadata.id);

  return `${authorizationEndpoint}?${stringify({
    appid: appId,
    redirect_uri: encodeURI(redirectUri), // The variable `redirectUri` should match {appId, appSecret}
    response_type: 'code',
    scope,
    state,
  })}`;
};

export const getAccessToken: GetAccessToken = async (code) => {
  type AccessTokenResponse = {
    access_token: string;
    openid: string;
    expires_in: number; // In seconds
    refresh_token: string;
    scope: string;
  };

  const config = await getConnectorConfig<WeChatConfig>(metadata.id);
  const { appId: appid, appSecret: secret } = config;

  const { access_token: accessToken, openid } = await got
    .get(accessTokenEndpoint, {
      searchParams: { appid, secret, code, grant_type: 'authorization_code' },
      timeout: await getConnectorRequestTimeout(),
    })
    .json<AccessTokenResponse>();

  assertThat(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

  return { accessToken, openid };
};

export const getUserInfo: GetUserInfo = async (accessTokenObject) => {
  type UserInfoResponse = {
    unionid?: string;
    headimgurl?: string;
    nickname?: string;
    errcode?: number;
    errmsg?: string;
  };

  const { accessToken, openid } = accessTokenObject;

  try {
    const { unionid, headimgurl, nickname, errmsg } = await got
      .get(userInfoEndpoint, {
        searchParams: { access_token: accessToken, openid },
        timeout: await getConnectorRequestTimeout(),
      })
      .json<UserInfoResponse>();

    if (!openid) {
      // If no openid is provided, there will be error per Tencent's API design
      throw new Error(errmsg);
    }

    return { id: unionid ?? openid, avatar: headimgurl, name: nickname };
  } catch (error: unknown) {
    if (error instanceof GotRequestError && error.response?.statusCode === 40_001) {
      throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
    }
    throw error;
  }
};
