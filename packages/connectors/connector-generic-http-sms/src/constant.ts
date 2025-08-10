import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

export const defaultMetadata: ConnectorMetadata = {
  id: 'generic-http-sms',
  target: 'generic-http-sms',
  platform: null,
  name: {
    en: 'GENERIC SMS CONNECTOR',
  },
  logo: './logo.svg',
  logoDark: './logo-dark.svg',
  description: {
    en: 'Send SMS via HTTP call.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'endpoint',
      label: 'Endpoint',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: 'https://example.com/your-http-sms-endpoint',
    },
    {
      key: 'method',
      label: 'HTTP Method',
      type: ConnectorConfigFormItemType.Select,
      required: true,
      selectItems: [
        { title: 'GET', value: 'GET' },
        { title: 'POST', value: 'POST' },
      ],
    },
    {
      key: 'authorization',
      label: 'Authorization Header',
      type: ConnectorConfigFormItemType.Text,
      required: false,
      placeholder: 'Bearer your-token',
    },
    {
      key: 'queryParams',
      label: 'Query Parameters',
      type: ConnectorConfigFormItemType.Json,
      required: false,
      placeholder: '{"to": "{{to}}", "message": "{{message}}"}',
    },
    {
      key: 'bodyParams',
      label: 'Request Body Parameters',
      type: ConnectorConfigFormItemType.Json,
      required: false,
      placeholder: '{"recipient": "{{recipient}}", "message": "{{message}}"}',
    },
    {
      key: 'headers',
      label: 'Additional Headers',
      type: ConnectorConfigFormItemType.Json,
      required: false,
      placeholder: '{"Content-Type": "application/json"}',
    },
    {
      key: 'templates',
      label: 'Templates',
      type: ConnectorConfigFormItemType.Json,
      required: true,
      placeholder: '{"Content-Type": "application/json"}',
    },
  ],
};
