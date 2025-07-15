import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorPlatform, ConnectorConfigFormItemType } from '@logto/connector-kit';

// See https://developers.line.biz/en/docs/line-login/overview/
export const authorizationEndpoint = 'https://access.line.me/oauth2/v2.1/authorize';
export const defaultScope = 'openid profile';
export const accessTokenEndpoint = 'https://api.line.me/oauth2/v2.1/token';
export const userInfoEndpoint = 'https://api.line.me/v2/profile';

export const defaultMetadata: ConnectorMetadata = {
  id: 'line-universal',
  target: 'line',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'Line',
    'zh-CN': 'Line',
    'tr-TR': 'Line',
    ko: 'Line',
  },
  logo: './logo.svg',
  logoDark: './logo-dark.svg',
  description: {
    en: 'Line is a social media platform for sharing information and connecting with friends.',
    'zh-CN': 'Line是一个分享信息和与朋友连接的社交媒体平台。',
    'tr-TR':
      'Line, bilgi paylaşma ve arkadaşlarınızla bağlantı kurma için bir sosyal medya platformudur.',
    ko: 'Line은 정보 공유와 친구들과의 연결을 위한 소셜 미디어 플랫폼입니다.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'clientId',
      type: ConnectorConfigFormItemType.Text,
      label: 'Client ID (Channel ID)',
      required: true,
    },
    {
      key: 'clientSecret',
      type: ConnectorConfigFormItemType.Text,
      label: 'Client Secret (Channel Secret)',
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
