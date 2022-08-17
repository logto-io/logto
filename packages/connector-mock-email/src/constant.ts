import { ConnectorType, ConnectorMetadata } from '@logto/connector-schemas';

export const defaultMetadata: ConnectorMetadata = {
  id: 'mock-email-service',
  target: 'mock-mail',
  type: ConnectorType.Email,
  platform: null,
  name: {
    en: 'Mock Mail Service',
    'zh-CN': 'Mock 邮件服务',
    'tr-TR': 'Mock Mail Servis',
    'ko-KR': 'Mock Mail Service',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'The description of Mock Mail Service.',
    'zh-CN': 'Mock 邮件服务的描述。',
    'tr-TR': 'Mock Mail Servis açıklaması.',
    'ko-KR': 'The description of Mock SMS Service.',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};
