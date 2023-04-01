import type { ConnectorMetadata } from '@logto/connector-kit';

export const defaultMetadata: ConnectorMetadata = {
  id: 'mock-email-service',
  target: 'mock-mail',
  platform: null,
  name: {
    en: 'Mock Mail Service',
    'zh-CN': 'Mock 邮件服务',
    'tr-TR': 'Mock Mail Servis',
    ko: 'Mock Mail Service',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'The description of Mock Mail Service.',
    'zh-CN': 'Mock 邮件服务的描述。',
    'tr-TR': 'Mock Mail Servis açıklaması.',
    ko: 'The description of Mock SMS Service.',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};
