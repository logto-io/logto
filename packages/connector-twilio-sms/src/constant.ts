import { ConnectorType, ConnectorMetadata } from '@logto/connector-types';

export const endpoint = 'https://api.twilio.com/2010-04-01/Accounts/{{accountSID}}/Messages.json';

export const defaultMetadata: ConnectorMetadata = {
  id: 'twilio-short-message-service',
  target: 'twilio-sms',
  type: ConnectorType.SMS,
  platform: null,
  name: {
    en: 'Twilio SMS Service',
    'zh-CN': 'Twilio 短信服务',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Messaging APIs for reliable SMS delivery.',
    'zh-CN': '可信赖的短信消息 API。',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};
