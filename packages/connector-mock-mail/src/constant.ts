import { ConnectorType, ConnectorMetadata } from '@logto/connector-types';

export const defaultMetadata: ConnectorMetadata = {
  id: 'mock-email-service',
  target: 'mock-mail',
  type: ConnectorType.Email,
  platform: null,
  name: {
    en: 'Mock Mail Service',
    'zh-CN': 'Mock 邮件服务',
    'tr-TR': 'Mock Mail Servis',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'The description of Mock Mail Service.',
    'zh-CN': 'Mock 邮件服务的描述。',
    'tr-TR': 'Mock Mail Servis açıklaması.',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};
