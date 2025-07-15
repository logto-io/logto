import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorPlatform, ConnectorConfigFormItemType } from '@logto/connector-kit';

export const authorizationEndpoint = 'https://twitter.com/i/oauth2/authorize';
export const defaultScope = 'tweet.read users.read';
export const accessTokenEndpoint = 'https://api.twitter.com/2/oauth2/token';
export const userInfoEndpoint = 'https://api.twitter.com/2/users/me';

export const defaultMetadata: ConnectorMetadata = {
  id: 'x-universal',
  target: 'x',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'X',
    'zh-CN': 'X',
    'tr-TR': 'X',
    ko: 'X',
  },
  logo: './logo.svg',
  logoDark: './logo-dark.svg',
  description: {
    en: 'X (formerly Twitter) is a social media platform for real-time conversation and information sharing.',
    'zh-CN': 'X（前身为 Twitter）是一个实时对话和信息分享的社交媒体平台。',
    'tr-TR':
      'X (eski adıyla Twitter), gerçek zamanlı sohbet ve bilgi paylaşımı için bir sosyal medya platformudur.',
    ko: 'X(구 Twitter)는 실시간 대화와 정보 공유를 위한 소셜 미디어 플랫폼입니다.',
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
      description: "The `scope` determines permissions granted by the user's authorization.",
    },
  ],
};

export const defaultTimeout = 5000;
