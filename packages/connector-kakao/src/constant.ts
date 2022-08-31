import { ConnectorMetadata, ConnectorPlatform } from '@logto/connector-core';

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
    'ko-KR': '카카오',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Kakao is the most famous social network servcie provider in South Korea',
    'zh-CN': 'Kakao is the most famous social network servcie provider in South Korea',
    'tr-TR': 'Kakao is the most famous social network servcie provider in South Korea',
    'ko-KR': '카카오는 한국에서 가장 유명한 SNS 서비스 제공자 입니다.',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};

export const defaultTimeout = 5000;
