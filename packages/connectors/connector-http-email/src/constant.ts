import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

export const defaultMetadata: ConnectorMetadata = {
  id: 'http-email',
  target: 'http-email',
  platform: null,
  name: {
    en: 'HTTP Email',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Send email via HTTP call.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'endpoint',
      label: 'Endpoint',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<https://example.com/your-http-endpoint>',
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
