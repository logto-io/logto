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
    'tr-TR': 'Google',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Google is the biggest search engine technology and email service provider.',
    'zh-CN': 'Google 是全球最大的搜索引擎和邮件服务提供商。',
    'tr-TR': 'Google is the biggest search engine technology and email service provider.',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};

export const defaultTimeout = 5000;
