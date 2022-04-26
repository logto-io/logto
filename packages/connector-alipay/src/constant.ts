import { ConnectorType, ConnectorMetadata } from '@logto/connector-types';

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
  id: 'alipay',
  type: ConnectorType.Social,
  name: {
    en: 'Sign In with Alipay',
    'zh-CN': '支付宝登录',
  },
  logo: './logo.png',
  description: {
    en: 'Sign In with Alipay',
    'zh-CN': '支付宝登录',
  },
};

export const defaultTimeout = 5000;
