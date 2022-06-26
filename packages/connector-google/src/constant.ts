import { ConnectorMetadata, ConnectorType, ConnectorPlatform } from '@logto/connector-types';

export const authorizationEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
export const accessTokenEndpoint = 'https://oauth2.googleapis.com/token';
export const userInfoEndpoint = 'https://openidconnect.googleapis.com/v1/userinfo';
export const scope = 'openid profile email';

export const defaultMetadata: ConnectorMetadata = {
  id: 'google-universal',
  target: 'google',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'Google',
    'zh-CN': 'Google',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Gives users the ability to sign in with their Google account.',
    'zh-CN': '赋予用户用 Google 账号登录的能力。',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};

export const defaultTimeout = 5000;
