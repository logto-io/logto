/**
 * The Implementation of OpenID Connect of WeChat Web Open Platform.
 * https://developers.weixin.qq.com/doc/oplatform/Mobile_App/WeChat_Login/Development_Guide.html
 */

import { stringify } from 'query-string';

import { metadata as weChatWebMetadata, WeChatConfig } from '@/connectors/wechat';

import { ConnectorMetadata, GetAuthorizationUri } from '../types';
import { getConnectorConfig } from '../utilities';
import { authorizationEndpoint, scope } from './constant';

export { validateConfig, getAccessToken, getUserInfo } from '@/connectors/wechat';

export const metadata: ConnectorMetadata = {
  ...weChatWebMetadata,
  id: 'wechat-native',
};

export const getAuthorizationUri: GetAuthorizationUri = async (redirectUri, state) => {
  const { appId } = await getConnectorConfig<WeChatConfig>(metadata.id);

  return `${authorizationEndpoint}?${stringify({
    appid: appId,
    redirect_uri: encodeURI(redirectUri), // The variable `redirectUri` should match {appId, appSecret}
    scope,
    state,
  })}`;
};
