import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

export const defaultMetadata: ConnectorMetadata = {
  id: 'logto-sms',
  target: 'logto-sms',
  platform: null,
  name: {
    en: 'Logto SMS',
  },
  logo: './logo.svg',
  logoDark: './logo-dark.svg',
  description: {
    en: 'Logto SMS service (demonstration).',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'tokenEndpoint',
      label: 'Endpoint',
      type: ConnectorConfigFormItemType.Text,
      required: true,
    },
    {
      key: 'endpoint',
      label: 'Endpoint',
      type: ConnectorConfigFormItemType.Text,
      required: true,
    },
    {
      key: 'resource',
      label: 'Resource',
      type: ConnectorConfigFormItemType.Text,
      required: true,
    },
    {
      key: 'appId',
      label: 'App ID',
      type: ConnectorConfigFormItemType.Text,
      required: true,
    },
    {
      key: 'appSecret',
      label: 'App Secret',
      type: ConnectorConfigFormItemType.Text,
      required: true,
    },
  ],
};

export const scope = ['send:sms'];

export const defaultTimeout = 5000;

export const smsEndpoint = '/services/send-sms';
