import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorPlatform, ConnectorConfigFormItemType } from '@logto/connector-kit';

// See https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin
export const authorizationEndpoint = 'https://www.linkedin.com/oauth/v2/authorization';
export const defaultScope = 'openid profile email';
export const accessTokenEndpoint = 'https://www.linkedin.com/oauth/v2/accessToken';
export const userInfoEndpoint = 'https://api.linkedin.com/v2/userinfo';

export const defaultMetadata: ConnectorMetadata = {
  id: 'linkedin-universal',
  target: 'linkedin',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'LinkedIn',
    'zh-CN': 'LinkedIn',
    'tr-TR': 'LinkedIn',
    ko: 'LinkedIn',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'LinkedIn is a social media platform for professional networking and information sharing.',
    'zh-CN': 'LinkedIn是一个职业社交和信息分享的社交媒体平台。',
    'tr-TR':
      'LinkedIn, profesyonel ağ oluşturma ve bilgi paylaşma için bir sosyal medya platformudur.',
    ko: 'LinkedIn은 전문 네트워킹과 정보 공유를 위한 소셜 미디어 플랫폼입니다.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'clientId',
      type: ConnectorConfigFormItemType.Text,
      label: 'Client ID',
      required: true,
    },
    {
      key: 'clientSecret',
      type: ConnectorConfigFormItemType.Text,
      label: 'Client Secret',
      required: true,
    },
    {
      key: 'scope',
      type: ConnectorConfigFormItemType.MultilineText,
      label: 'Scope',
      required: false,
      description: "The `scope` determines permissions granted by the user's authorization. ",
    },
  ],
};

export const defaultTimeout = 5000;
