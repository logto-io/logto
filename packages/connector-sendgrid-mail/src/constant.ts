import { ConnectorType, ConnectorMetadata } from '@logto/connector-types';

export const endpoint = 'https://api.sendgrid.com/v3/mail/send';

export const defaultMetadata: ConnectorMetadata = {
  id: 'sendgrid-email-service',
  target: 'sendgrid-mail',
  type: ConnectorType.Email,
  platform: null,
  name: {
    en: 'SendGrid Mail Service',
    'zh-CN': 'SendGrid 邮件服务',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Leverage the email service that customer-first brands trust for reliable inbox delivery at scale.',
    'zh-CN': '客户至上品牌信任的电子邮件服务，实现大规模可靠的收件箱递送。',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};
