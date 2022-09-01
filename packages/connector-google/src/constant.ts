import { ConnectorMetadata, ConnectorPlatform } from '@logto/connector-core';

export const authorizationEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
export const accessTokenEndpoint = 'https://oauth2.googleapis.com/token';
export const userInfoEndpoint = 'https://openidconnect.googleapis.com/v1/userinfo';
export const scope = 'openid profile email';

export const defaultMetadata: ConnectorMetadata = {
  id: 'google-universal',
  target: 'google',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'Google',
    'zh-CN': 'Google',
    'tr-TR': 'Google',
    'ko-KR': 'Google',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Google is the biggest search engine technology and email service provider.',
    'zh-CN': 'Google 是全球最大的搜索引擎和邮件服务提供商。',
    'tr-TR': 'Google, en büyük arama motoru teknolojisi ve e-posta servis sağlayıcısıdır.',
    'ko-KR': 'Google은 가장 큰 검색 엔진 기술과 이메일 서비스 제공자입니다.',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};

export const defaultTimeout = 5000;
