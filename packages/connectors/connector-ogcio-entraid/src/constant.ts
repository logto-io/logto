import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorPlatform, ConnectorConfigFormItemType, OidcPrompt } from '@logto/connector-kit';

export const graphAPIEndpoint = 'https://graph.microsoft.com/v1.0/me';
export const scopes = ['User.Read'];

export const defaultMetadata: ConnectorMetadata = {
  id: 'ogcio-entraid',
  target: 'entraid',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'OGCIO EntraID',
    'zh-CN': 'OGCIO EntraID',
    'tr-TR': 'OGCIO EntraID',
    ko: 'OGCIO EntraID',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'OGCIO EntraID',
    'zh-CN': 'OGCIO EntraID',
    'tr-TR': 'OGCIO EntraID',
    ko: 'OGCIO EntraID',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'clientId',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      label: 'Client ID',
      placeholder: '<client-id>',
    },
    {
      key: 'clientSecret',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      label: 'Client Secret',
      placeholder: '<client-secret>',
    },
    {
      key: 'cloudInstance',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      label: 'Cloud Instance',
      placeholder: 'https://login.microsoftonline.com',
      defaultValue: 'https://login.microsoftonline.com',
    },
    {
      key: 'tenantId',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      label: 'Tenant ID',
      placeholder: '<tenant-id>',
    },
    {
      key: 'prompts',
      type: ConnectorConfigFormItemType.MultiSelect,
      required: false,
      label: 'Prompts',
      selectItems: Object.values(OidcPrompt).map((prompt) => ({
        value: prompt,
      })),
    },
  ],
};

export const defaultTimeout = 5000;
