import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

export const defaultMetadata: ConnectorMetadata = {
  id: 'postmark-mail',
  target: 'postmark-mail',
  platform: null,
  name: {
    en: 'Postmark Mail',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Postmark is a mail sending platform.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'serverToken',
      label: 'Server Token',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<your-server-token>',
    },
    {
      key: 'fromEmail',
      label: 'From Email',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<from_email_address@your.domain>',
    },
    {
      key: 'templates',
      label: 'Templates',
      type: ConnectorConfigFormItemType.Json,
      required: true,
      defaultValue: [
        {
          usageType: 'SignIn',
          templateAlias: 'logto-sign-in',
        },
        {
          usageType: 'Register',
          templateAlias: 'logto-register',
        },
        {
          usageType: 'ForgotPassword',
          templateAlias: 'logto-forgot-password',
        },
        {
          usageType: 'Generic',
          templateAlias: 'logto-generic',
        },
      ],
    },
  ],
};
