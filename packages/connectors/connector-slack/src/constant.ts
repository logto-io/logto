import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorPlatform, ConnectorConfigFormItemType } from '@logto/connector-kit';

export const authorizationEndpoint = 'https://slack.com/openid/connect/authorize';
export const defaultScope = 'openid profile email';
export const accessTokenEndpoint = 'https://slack.com/api/openid.connect.token';

export const defaultMetadata: ConnectorMetadata = {
  id: 'slack-universal',
  target: 'slack',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'Slack',
    'zh-CN': 'Slack',
    'tr-TR': 'Slack',
    ko: 'Slack',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Slack is a team communication platform for real-time conversation and information sharing.',
    'zh-CN': 'Slack 是一个团队沟通平台，用于实时对话和信息共享。',
    'tr-TR':
      'Slack, gerçek zamanlı sohbet ve bilgi paylaşımı için bir takım iletişim platformudur.',
    ko: 'Slack은 실시간 대화와 정보 공유를 위한 팀 통신 플랫폼입니다.',
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
