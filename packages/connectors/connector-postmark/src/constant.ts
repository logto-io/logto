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
    'zh-CN': 'Postmark 是一个邮件发送平台。',
    'tr-TR': 'Postmark, bir e-posta gönderim platformudur.',
    ko: 'Postmark는 이메일 발송 플랫폼입니다.',
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
          usageType: 'OrganizationInvitation',
          templateAlias: 'logto-organization-invitation',
        },
        {
          usageType: 'Generic',
          templateAlias: 'logto-generic',
        },
        {
          usageType: 'UserPermissionValidation',
          templateAlias: 'logto-user-permission-validation',
        },
        {
          usageType: 'BindNewIdentifier',
          templateAlias: 'logto-bind-new-identifier',
        },
        {
          usageType: 'MfaVerification',
          templateAlias: 'logto-mfa-verification',
        },
        {
          usageType: 'BindMfa',
          templateAlias: 'logto-bind-mfa',
        },
      ],
    },
  ],
};
