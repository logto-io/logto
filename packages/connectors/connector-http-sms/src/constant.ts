import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

export const defaultMetadata: ConnectorMetadata = {
  id: 'http-sms',
  target: 'http-sms',
  platform: null,
  name: {
    en: 'HTTP SMS',
  },
  logo: './logo.svg',
  logoDark: './logo-dark.svg',
  description: {
    en: 'Send SMS via HTTP call.',
    'zh-CN': '通过 HTTP 调用发送短信。',
    'tr-TR': 'HTTP isteği aracılığıyla SMS gönderin.',
    ko: 'HTTP 호출을 통해 SMS를 보냅니다.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'endpoint',
      label: 'Endpoint',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<https://example.com/your-http-sms-endpoint>',
    },
    {
      key: 'authorization',
      label: 'Authorization Header',
      type: ConnectorConfigFormItemType.Text,
      required: false,
      placeholder: '<Bearer your-token>',
      tooltip:
        'The authorization header to be sent with the request, you can verify the value in your server.',
    },
  ],
};
