/**
 * The Implementation of OpenID Connect of WeChat Web Open Platform.
 * https://developers.weixin.qq.com/doc/oplatform/Mobile_App/WeChat_Login/Development_Guide.html
 */

import {
  ConnectorMetadata,
  GetAuthorizationUri,
  GetConnectorConfig,
  GetTimeout,
} from '@logto/connector-types';
import { WeChatConfig, WeChatConnector } from '@logto/connector-wechat';
import { stringify } from 'query-string';

import { authorizationEndpoint, scope } from './constant';

export type { WeChatConfig } from '@logto/connector-wechat';

export class WeChatNativeConnector extends WeChatConnector {
  public metadata: ConnectorMetadata = { ...this.metadata, id: 'wechat-native' };

  constructor(
    getConnectorConfig: GetConnectorConfig<WeChatConfig>,
    getConnectorRequestTimeout: GetTimeout
  ) {
    super(getConnectorConfig, getConnectorRequestTimeout);
    this.getConfig = getConnectorConfig;
    this.getRequestTimeout = getConnectorRequestTimeout;
  }

  public getAuthorizationUri: GetAuthorizationUri = async (redirectUri, state) => {
    const { appId } = await this.getConfig(this.metadata.id);

    return `${authorizationEndpoint}?${stringify({
      appid: appId,
      redirect_uri: encodeURI(redirectUri), // The variable `redirectUri` should match {appId, appSecret}
      scope,
      state,
    })}`;
  };
}
