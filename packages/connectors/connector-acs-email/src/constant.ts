import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

export const apiVersion = '2023-03-31';

export const defaultMetadata: ConnectorMetadata = {
  id: 'acs-email-service',
  target: 'acs-mail',
  platform: null,
  name: {
    en: 'Azure Communication Services Email',
    'zh-CN': 'Azure 通信服务邮件',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Send transactional email through Azure Communication Services Email.',
    'zh-CN': '通过 Azure 通信服务邮件发送事务性邮件。',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'endpoint',
      label: 'Endpoint',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: 'https://<your-resource>.communication.azure.com',
    },
    {
      key: 'accessKey',
      label: 'Access Key',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<your-acs-access-key>',
    },
    {
      key: 'fromEmail',
      label: 'Sender Address',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: 'DoNotReply@<your-verified-domain>',
    },
    {
      key: 'templates',
      label: 'Templates',
      type: ConnectorConfigFormItemType.Json,
      required: true,
      defaultValue: [
        {
          usageType: 'SignIn',
          type: 'text/plain',
          subject: 'Logto SignIn Template',
          content:
            'Your Logto sign-in verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'Register',
          type: 'text/plain',
          subject: 'Logto Register Template',
          content:
            'Your Logto sign-up verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'ForgotPassword',
          type: 'text/plain',
          subject: 'Logto ForgotPassword Template',
          content:
            'Your Logto password change verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'OrganizationInvitation',
          type: 'text/plain',
          subject: 'Logto OrganizationInvitation Template',
          content:
            'Your Logto organization invitation code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'Generic',
          type: 'text/plain',
          subject: 'Logto Generic Template',
          content:
            'Your Logto verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'UserPermissionValidation',
          type: 'text/plain',
          subject: 'Logto UserPermissionValidation Template',
          content:
            'Your Logto permission validation code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'BindNewIdentifier',
          type: 'text/plain',
          subject: 'Logto BindNewIdentifier Template',
          content:
            'Your Logto new identifier binding code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'MfaVerification',
          type: 'text/plain',
          subject: 'Logto MfaVerification Template',
          content:
            'Your Logto MFA verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'BindMfa',
          type: 'text/plain',
          subject: 'Logto BindMfa Template',
          content:
            'Your Logto 2-step verification setup code is {{code}}. The code will remain active for 10 minutes.',
        },
      ],
    },
  ],
};
