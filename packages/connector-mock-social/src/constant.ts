import { ConnectorMetadata, ConnectorPlatform } from '@logto/connector-core';

export const defaultMetadata: ConnectorMetadata = {
  id: 'mock-social-connector',
  target: 'mock-social',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'Mock Social',
    'zh-CN': 'Mock 社交登录',
    'ko-KR': 'Mock Social',
    'tr-TR': 'Mock Social',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Social mock connector description',
    'zh-CN': 'Mock 社交登录连接器的描述',
    'ko-KR': 'Social mock connector description',
    'tr-TR': 'Social mock connector description',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};
