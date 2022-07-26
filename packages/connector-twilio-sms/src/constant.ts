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
    'ko-KR': 'Twilio SMS 서비스',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Twilio provides programmable communication tools for phone calls and messages.',
    'zh-CN': 'Twilio 是一个提供面向消费者的可编程通讯服务的平台。',
    'ko-KR': 'Twilio는 전화 및 SMS을 할 수 있도록 개발자 도구를 제공합니다.',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};
