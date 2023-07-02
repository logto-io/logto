import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

export const endpoint = `https://gate.smsaero.ru/v2/sms/send`;

export const defaultMetadata: ConnectorMetadata = {
  id: 'smsaero-short-message-service',
  target: 'smsaero-sms',
  platform: null,
  name: {
    en: 'SMS Aero service',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'SMS Aero offers users to use SMS-mailing in 5 minutes without viewing the contract. Developers are offered a convenient API with accessible classes and 24x7 chat support.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'email',
      label: 'Email',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<account-email>',
    },
    {
      key: 'apiKey',
      label: 'API Key',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<api-key>',
    },
    {
      key: 'senderName',
      label: 'Sender Name',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: 'SMSAero',
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
