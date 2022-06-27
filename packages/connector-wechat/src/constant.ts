import { ConnectorMetadata, ConnectorType, ConnectorPlatform } from '@logto/connector-types';

export const authorizationEndpoint = 'https://open.weixin.qq.com/connect/qrconnect';
export const accessTokenEndpoint = 'https://api.weixin.qq.com/sns/oauth2/access_token';
export const userInfoEndpoint = 'https://api.weixin.qq.com/sns/userinfo';
export const scope = 'snsapi_login';

export const defaultMetadata: ConnectorMetadata = {
  id: 'wechat-web',
  target: 'wechat',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Web,
  name: {
    en: 'WeChat',
    'zh-CN': '微信',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Allow your users to sign in through their WeChat account.',
    'zh-CN': '让用户可以通过微信账号登录。',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};

export const defaultTimeout = 5000;
