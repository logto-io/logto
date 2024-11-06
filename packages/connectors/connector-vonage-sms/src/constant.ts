import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

export const defaultMetadata: ConnectorMetadata = {
  id: 'vonage-sms',
  target: 'vonage-sms',
  platform: null,
  name: {
    en: 'Vonage SMS Service',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Communications APIs to connect the world',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'apiKey',
      label: 'API Key',
      type: ConnectorConfigFormItemType.Text,
      required: true,
    },
    {
      key: 'apiSecret',
      label: 'API Secret',
      type: ConnectorConfigFormItemType.Text,
      required: true,
    },
    {
      key: 'brandName',
      label: 'Brand Name',
      type: ConnectorConfigFormItemType.Text,
      required: true,
    },
    {
      key: 'templates',
      label: 'Templates',
      type: ConnectorConfigFormItemType.Json,
      required: true,
      defaultValue: [
        {
          usageType: 'SignIn',
          content:
            'Your Logto sign-in verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'Register',
          content:
            'Your Logto sign-up verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'ForgotPassword',
          content:
            'Your Logto password change verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'Generic',
          content:
            'Your Logto verification code is {{code}}. The code will remain active for 10 minutes.',
        },
      ],
    },
  ],
};
