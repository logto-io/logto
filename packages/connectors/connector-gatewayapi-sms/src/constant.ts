import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

export const endpoint = 'https://api.twilio.com/2010-04-01/Accounts/{{accountSID}}/Messages.json';

export const defaultMetadata: ConnectorMetadata = {
  id: 'gatewayapi-sms',
  target: 'gatewayapi-sms',
  platform: null,
  name: {
    en: 'GatewayAPI SMS Service',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'GatewayAPI accelerates development by removing the learning curve and guesswork, so you can get down to building right away with our APIs.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'endpoint',
      label: 'Endpoint',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: 'https://gatewayapi.com/rest/mtsms',
      defaultValue: 'https://gatewayapi.com/rest/mtsms',
    },
    {
      key: 'apiToken',
      label: 'API Token',
      type: ConnectorConfigFormItemType.Text,
      required: true,
    },
    {
      key: 'sender',
      label: 'Sender',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: 'ExampleSMS',
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
