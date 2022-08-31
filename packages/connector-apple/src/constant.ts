import { ConnectorMetadata, ConnectorType, ConnectorPlatform } from '@logto/connector-core';

// https://appleid.apple.com/.well-known/openid-configuration
export const issuer = 'https://appleid.apple.com';
export const authorizationEndpoint = `${issuer}/auth/authorize`;
export const accessTokenEndpoint = `${issuer}/auth/token`;
export const jwksUri = `${issuer}/auth/keys`;

// Note: only support fixed scope for v1.
export const scope = ''; // Note: `openid` is required when adding more scope(s)

export const defaultMetadata: ConnectorMetadata = {
  id: 'apple-universal',
  target: 'apple',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'Apple',
    'zh-CN': 'Apple',
    'tr-TR': 'Apple',
    'ko-KR': 'Apple',
  },
  logo: './logo.svg',
  logoDark: './logo-dark.svg',
  description: {
    en: 'Apple is a multinational high-end provider of hardware and software.',
    'zh-CN': 'Apple 是全球领先的高端消费者软硬件提供商。',
    'tr-TR': 'Apple, çok uluslu bir üst düzey donanım ve yazılım sağlayıcısıdır.',
    'ko-KR': 'Apple은 하드웨어와 소프트웨어의 다국적 공급자 입니다.',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};

export const defaultTimeout = 5000;
