import { ConnectorType, ConnectorMetadata, ConnectorPlatform } from '@logto/connector-types';

export const authorizationEndpoint = 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm';
export const alipayEndpoint = 'https://openapi.alipay.com/gateway.do';
export const scope = 'auth_user';
export const methodForAccessToken = 'alipay.system.oauth.token';
export const methodForUserInfo = 'alipay.user.info.share';

export const alipaySigningAlgorithmMapping = {
  RSA: 'RSA-SHA1',
  RSA2: 'RSA-SHA256',
} as const;
export const alipaySigningAlgorithms = ['RSA', 'RSA2'] as const;

export const defaultMetadata: ConnectorMetadata = {
  id: 'alipay-web',
  target: 'alipay',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Web,
  name: {
    en: 'Alipay',
    'zh-CN': '支付宝',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Allow your users to sign in through their Alipay account.',
    'zh-CN': '让用户可以通过支付宝账号登录。',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};

export const defaultTimeout = 5000;

export const timestampFormat = 'YYYY-MM-DD HH:mm:ss';
