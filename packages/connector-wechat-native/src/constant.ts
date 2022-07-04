import { ConnectorMetadata, ConnectorType, ConnectorPlatform } from '@logto/connector-types';

export const authorizationEndpoint = 'wechat://'; // This is used to arouse the native WeChat App
export const accessTokenEndpoint = 'https://api.weixin.qq.com/sns/oauth2/access_token';
export const userInfoEndpoint = 'https://api.weixin.qq.com/sns/userinfo';
export const scope = 'snsapi_userinfo';

export const defaultMetadata: ConnectorMetadata = {
  id: 'wechat-native',
  target: 'wechat',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Native,
  name: {
    en: 'WeChat',
    'zh-CN': '微信',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'WeChat is a cross-platform instant messaging app.',
    'zh-CN': '微信是一款跨平台的即时通讯软件。',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};

export const defaultTimeout = 5000;
