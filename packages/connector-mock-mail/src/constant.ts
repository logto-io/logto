import { ConnectorType, ConnectorMetadata } from '@logto/connector-types';

export const defaultMetadata: ConnectorMetadata = {
  id: 'mock-email-service',
  target: 'mock-mail',
  type: ConnectorType.Email,
  platform: null,
  name: {
    en: 'Mock Mail Service',
    'zh-CN': 'Mock 邮件服务',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'The description of Mock SMS Service.',
    'zh-CN': 'Mock 邮件服务的描述。',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};
