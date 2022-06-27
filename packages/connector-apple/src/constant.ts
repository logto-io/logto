import { ConnectorMetadata, ConnectorType, ConnectorPlatform } from '@logto/connector-types';

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
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'Apple',
    'zh-CN': 'Apple',
  },
  logo: './logo.svg',
  logoDark: './logo-dark.svg',
  description: {
    en: 'Enables users to sign in to the Logto app through their Apple account.',
    'zh-CN': '让用户能够通过 Apple 账号登录 Logto 应用。',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};

export const defaultTimeout = 5000;
