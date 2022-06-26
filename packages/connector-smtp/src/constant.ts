import { ConnectorType, ConnectorMetadata } from '@logto/connector-types';

export const defaultMetadata: ConnectorMetadata = {
  id: 'simple-mail-transfer-protocol',
  target: 'smtp',
  type: ConnectorType.Email,
  platform: null,
  name: {
    en: 'SMTP',
    'zh-CN': 'SMTP',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Simple Mail Transfer Protocol.',
    'zh-CN': '简单邮件传输协议。',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};
