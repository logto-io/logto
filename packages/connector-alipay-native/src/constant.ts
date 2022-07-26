import { ConnectorType, ConnectorMetadata, ConnectorPlatform } from '@logto/connector-types';

export const authorizationEndpoint = 'alipay://'; // This is used to arouse the native Alipay App
export const alipayEndpoint = 'https://openapi.alipay.com/gateway.do';
export const methodForAccessToken = 'alipay.system.oauth.token';
export const methodForUserInfo = 'alipay.user.info.share';

export const alipaySigningAlgorithmMapping = {
  RSA: 'RSA-SHA1',
  RSA2: 'RSA-SHA256',
} as const;
export const alipaySigningAlgorithms = ['RSA', 'RSA2'] as const;

export const invalidAccessTokenCode = ['20001'];

export const invalidAccessTokenSubCode = ['isv.code-invalid'];

export const defaultMetadata: ConnectorMetadata = {
  id: 'alipay-native',
  target: 'alipay',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Native,
  name: {
    en: 'Alipay',
    'zh-CN': '支付宝',
    'ko-KR': 'Alipay',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Alipay is a third-party mobile and online payment platform.',
    'zh-CN': '支付宝是一个第三方支付平台。',
    'ko-KR': 'Alipay는 서드파티 모바일 및 온라인 결제 플랫폼 입니다.',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};

export const defaultTimeout = 5000;

export const timestampFormat = 'YYYY-MM-DD HH:mm:ss';
