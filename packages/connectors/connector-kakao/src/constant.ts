import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorPlatform, ConnectorConfigFormItemType } from '@logto/connector-kit';

export const authorizationEndpoint = 'https://kauth.kakao.com/oauth/authorize';
export const accessTokenEndpoint = 'https://kauth.kakao.com/oauth/token';
export const userInfoEndpoint = 'https://kapi.kakao.com/v2/user/me';

export const defaultMetadata: ConnectorMetadata = {
  id: 'kakao-universal',
  target: 'kakao',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'Kakao',
    'zh-CN': 'Kakao',
    'tr-TR': 'Kakao',
    ko: '카카오',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Kakao is a famous social network service provider in South Korea',
    'zh-CN': 'Kakao 是韩国著名的社交网络服务提供商。',
    'tr-TR': 'Kakao is a famous social network service provider in South Korea', // UNTRANSLATED
    ko: '카카오는 한국에서 가장 유명한 SNS 서비스 제공자 입니다.', // UNTRANSLATED
  },
  readme: './README.md',
  formItems: [
    {
      key: 'clientId',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      label: 'Client ID',
      placeholder: '<client-id>',
    },
    {
      key: 'clientSecret',
      type: ConnectorConfigFormItemType.Text,
      required: false,
      label: 'Client Secret',
      placeholder: '<client-secret>',
    },
  ],
};

export const defaultTimeout = 5000;
