import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorPlatform, ConnectorConfigFormItemType } from '@logto/connector-kit';

// https://appleid.apple.com/.well-known/openid-configuration
export const issuer = 'https://appleid.apple.com';
export const authorizationEndpoint = `${issuer}/auth/authorize`;
export const accessTokenEndpoint = `${issuer}/auth/token`;
export const jwksUri = `${issuer}/auth/keys`;

export const defaultMetadata: ConnectorMetadata = {
  id: 'apple-universal',
  target: 'apple',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'Apple',
    'zh-CN': 'Apple',
    'tr-TR': 'Apple',
    ko: 'Apple',
  },
  logo: './logo.svg',
  logoDark: './logo-dark.svg',
  description: {
    en: 'Apple is a multinational high-end provider of hardware and software.',
    'zh-CN': 'Apple 是全球领先的高端消费者软硬件提供商。',
    'tr-TR': 'Apple, çok uluslu bir üst düzey donanım ve yazılım sağlayıcısıdır.',
    ko: 'Apple은 하드웨어와 소프트웨어의 다국적 공급자 입니다.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'clientId',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      label: 'Identifier',
      placeholder: '<your-registered-identifier>',
    },
    {
      key: 'scope',
      type: ConnectorConfigFormItemType.MultilineText,
      required: false,
      label: 'Scope',
      placeholder: 'email name',
    },
  ],
};

export const defaultTimeout = 5000;
