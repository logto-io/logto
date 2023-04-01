import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorPlatform, ConnectorConfigFormItemType } from '@logto/connector-kit';

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
export const charsetEnum = ['gbk', 'utf8'] as const;
export const fallbackCharset = 'utf8';

export const invalidAccessTokenCode = ['20001'];

export const invalidAccessTokenSubCode = ['isv.code-invalid'];

export const defaultMetadata: ConnectorMetadata = {
  id: 'alipay-web',
  target: 'alipay',
  platform: ConnectorPlatform.Web,
  name: {
    en: 'Alipay',
    'zh-CN': '支付宝',
    'tr-TR': 'Alipay',
    ko: 'Alipay',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Alipay is a third-party mobile and online payment platform.',
    'zh-CN': '支付宝是一个第三方支付平台。',
    'tr-TR': 'Alipay, üçüncü şahıslara ait bir mobil ve çevrimiçi ödeme platformudur.',
    ko: 'Alipay는 서드파티 모바일 및 온라인 결제 플랫폼 입니다.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'appId',
      label: 'App ID',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<app-id-with-maximum-length-16>',
    },
    {
      key: 'privateKey',
      label: 'Private Key',
      type: ConnectorConfigFormItemType.MultilineText,
      required: true,
      placeholder: '<private-key>',
    },
    {
      key: 'signType',
      label: 'Signing Algorithm',
      type: ConnectorConfigFormItemType.Select,
      selectItems: [
        { title: 'RSA-SHA1', value: 'RSA' },
        { title: 'RSA-SHA256', value: 'RSA2' },
      ],
      defaultValue: 'RSA2',
    },
    {
      key: 'charset',
      label: 'Char Set',
      type: ConnectorConfigFormItemType.Select,
      selectItems: [
        { title: 'gbk', value: 'gbk' },
        { title: 'utf8', value: 'utf8' },
      ],
      defaultValue: 'utf8',
    },
  ],
};

export const defaultTimeout = 5000;

export const timestampFormat = 'YYYY-MM-DD HH:mm:ss';
