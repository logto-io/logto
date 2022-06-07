/**
 * The Implementation of OpenID Connect of WeChat Web Open Platform.
 * https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html
 */

import {
  ConnectorMetadata,
  GetAuthorizationUri,
  ValidateConfig,
  GetUserInfo,
  ConnectorError,
  ConnectorErrorCodes,
  SocialConnector,
  GetConnectorConfig,
  codeDataGuard,
} from '@logto/connector-types';
import { assert } from '@silverhand/essentials';
import got, { RequestError as GotRequestError } from 'got';

import {
  authorizationEndpoint,
  accessTokenEndpoint,
  userInfoEndpoint,
  defaultMetadata,
  defaultTimeout,
} from './constant';
import {
  weChatNativeConfigGuard,
  AccessTokenResponse,
  UserInfoResponse,
  WeChatNativeConfig,
} from './types';

export default class WeChatNativeConnector implements SocialConnector {
  public metadata: ConnectorMetadata = defaultMetadata;

  constructor(public readonly getConfig: GetConnectorConfig<WeChatNativeConfig>) {}

  public validateConfig: ValidateConfig = async (config: unknown) => {
    const result = weChatNativeConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
    }
  };

  public getAuthorizationUri: GetAuthorizationUri = async ({ state }) => {
    const { appId, universalLinks } = await this.getConfig(this.metadata.id);

    const queryParameters = new URLSearchParams({
      app_id: appId,
      state,
      // `universalLinks` is used by Wechat open platform website,
      // while `universal_link` is their API requirement.
      ...(universalLinks && { universal_link: universalLinks }),
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

  public getAccessToken = async (code: string) => {
    const { appId: appid, appSecret: secret } = await this.getConfig(this.metadata.id);

    const {
      access_token: accessToken,
      openid,
      errcode,
      errmsg,
    } = await got
      .get(accessTokenEndpoint, {
        searchParams: { appid, secret, code, grant_type: 'authorization_code' },
        timeout: defaultTimeout,
      })
      .json<AccessTokenResponse>();

    assert(errcode !== 40_029, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));
    assert(!errcode && accessToken && openid, new Error(errmsg ?? ''));

    return { accessToken, openid };
  };

  public getUserInfo: GetUserInfo = async (data) => {
    const { code } = codeDataGuard.parse(data);
    const { accessToken, openid } = await this.getAccessToken(code);

    try {
      const { unionid, headimgurl, nickname, errcode, errmsg } = await got
        .get(userInfoEndpoint, {
          searchParams: { access_token: accessToken, openid },
          timeout: defaultTimeout,
        })
        .json<UserInfoResponse>();

      // Response properties of user info can be separated into two groups: (1) {unionid, headimgurl, nickname}, (2) {errcode, errmsg}.
      // These two groups are mutually exclusive: if group (1) is not empty, group (2) should be empty and vice versa.
      // 'errmsg' and 'errcode' turn to non-empty values or empty values at the same time. Hence, if 'errmsg' is non-empty then 'errcode' should be non-empty.

      assert(errcode !== 40_001, new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid));
      assert(!errcode, new Error(errmsg));

      return { id: unionid ?? openid, avatar: headimgurl, name: nickname };
    } catch (error: unknown) {
      assert(
        !(error instanceof GotRequestError && error.response?.statusCode === 401),
        new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid)
      );

      throw error;
    }
  };
}
