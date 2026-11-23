import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

export const endpoint = 'https://www.kwtsms.com/API/send/';

export const defaultMetadata: ConnectorMetadata = {
  id: 'kwtsms-short-message-service',
  target: 'kwtsms',
  platform: null,
  name: {
    en: 'kwtSMS',
  },
  logo: './logo.png',
  logoDark: null,
  description: {
    en: 'kwtSMS is an SMS gateway in Kuwait with a simple JSON API, Arabic and Unicode support, and a free test mode.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'username',
      label: 'API Username',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<api-username>',
      tooltip: 'The API username from your kwtSMS account (not your mobile number or login).',
    },
    {
      key: 'password',
      label: 'API Password',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      isConfidential: true,
      placeholder: '<api-password>',
    },
    {
      key: 'senderId',
      label: 'Sender ID',
      type: ConnectorConfigFormItemType.Text,
      required: false,
      placeholder: 'KWT-SMS',
      defaultValue: 'KWT-SMS',
      tooltip: 'KWT-SMS is for testing only. Register a private Sender ID for production.',
    },
    {
      key: 'testMode',
      label: 'Test mode',
      type: ConnectorConfigFormItemType.Switch,
      required: false,
      defaultValue: false,
      description:
        'When on, messages are queued but never delivered (test=1), so no verification code reaches the user. Use it only while you set up.',
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
          usageType: 'OrganizationInvitation',
          content:
            'Your Logto organization invitation code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'Generic',
          content:
            'Your Logto verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'UserPermissionValidation',
          content:
            'Your Logto permission validation code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'BindNewIdentifier',
          content:
            'Your Logto new identifier binding code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'MfaVerification',
          content:
            'Your Logto MFA verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'BindMfa',
          content:
            'Your Logto 2-step verification setup code is {{code}}. The code will remain active for 10 minutes.',
        },
      ],
    },
  ],
};
