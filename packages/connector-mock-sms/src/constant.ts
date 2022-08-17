import { ConnectorType, ConnectorMetadata } from '@logto/connector-schemas';

export const defaultMetadata: ConnectorMetadata = {
  id: 'mock-short-message-service',
  target: 'mock-sms',
  type: ConnectorType.SMS,
  platform: null,
  name: {
    en: 'Mock SMS Service',
    'zh-CN': 'Mock 短信服务',
    'tr-TR': 'Mock SMS Servis',
    'ko-KR': 'Mock SMS Service',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'The description of Mock SMS Service.',
    'zh-CN': 'Mock 短信服务的描述。',
    'tr-TR': 'Mock SMS Servis açıklaması.',
    'ko-KR': 'The description of Mock SMS Service.',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};
