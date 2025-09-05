import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

export const defaultMetadata: ConnectorMetadata = {
  id: 'simple-mail-transfer-protocol',
  target: 'smtp',
  platform: null,
  name: {
    en: 'SMTP',
    'zh-CN': 'SMTP',
    'tr-TR': 'SMTP',
    ko: 'SMTP',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'The SMTP is an internet standard communication protocol for electronic mail transmission.',
    'zh-CN': 'SMTP 是简单邮件通讯协议的缩写，可对接所有邮件服务提供商。',
    'tr-TR': 'SMTP, elektronik posta iletimi için internet standart iletişim protokolüdür.',
    ko: 'SMTP는 이메일 전송을 위한 표준 통신 규약 입니다.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'host',
      label: 'Host',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<host>',
    },
    {
      key: 'port',
      label: 'Port',
      type: ConnectorConfigFormItemType.Number,
      required: true,
      placeholder: '25',
    },
    {
      key: 'auth',
      label: 'Auth',
      type: ConnectorConfigFormItemType.Json,
      required: true,
      defaultValue: {
        type: 'login',
        user: '<username>',
        pass: '<password>',
      },
    },
    {
      key: 'fromEmail',
      label: 'From Email',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<from_email_address@your.domain>',
    },
    {
      key: 'replyTo',
      label: 'Reply To',
      type: ConnectorConfigFormItemType.Text,
      required: false,
      placeholder: '<do-reply@your.domain>',
    },
    {
      key: 'templates',
      label: 'Templates',
      type: ConnectorConfigFormItemType.Json,
      required: true,
      defaultValue: [
        {
          contentType: 'text/plain',
          content:
            'Your Logto sign-in verification code is {{code}}. The code will remain active for 10 minutes.',
          subject: 'Logto Sign In with SMTP',
          usageType: 'SignIn',
        },
        {
          contentType: 'text/plain',
          content:
            'Your Logto sign-up verification code is {{code}}. The code will remain active for 10 minutes.',
          subject: 'Logto register with SMTP',
          usageType: 'Register',
        },
        {
          contentType: 'text/plain',
          content:
            'Your Logto password change verification code is {{code}}. The code will remain active for 10 minutes.',
          subject: 'Logto Forgot Password with SMTP',
          usageType: 'ForgotPassword',
        },
        {
          contentType: 'text/plain',
          content:
            'Your Logto organization invitation code is {{code}}. The code will remain active for 10 minutes.',
          subject: 'Logto OrganizationInvitation with SMTP',
          usageType: 'OrganizationInvitation',
        },
        {
          contentType: 'text/plain',
          content:
            'Your Logto verification code is {{code}}. The code will remain active for 10 minutes.',
          subject: 'Logto Generic with SMTP',
          usageType: 'Generic',
        },
        {
          contentType: 'text/plain',
          content:
            'Your Logto permission validation code is {{code}}. The code will remain active for 10 minutes.',
          subject: 'Logto UserPermissionValidation with SMTP',
          usageType: 'UserPermissionValidation',
        },
        {
          contentType: 'text/plain',
          content:
            'Your Logto new identifier binding code is {{code}}. The code will remain active for 10 minutes.',
          subject: 'Logto BindNewIdentifier with SMTP',
          usageType: 'BindNewIdentifier',
        },
        {
          contentType: 'text/plain',
          content:
            'Your Logto MFA verification code is {{code}}. The code will remain active for 10 minutes.',
          subject: 'Logto MfaVerification with SMTP',
          usageType: 'MfaVerification',
        },
        {
          contentType: 'text/plain',
          content:
            'Your Logto 2-step verification setup code is {{code}}. The code will remain active for 10 minutes.',
          subject: 'Logto BindMfa with SMTP',
          usageType: 'BindMfa',
        },
      ],
    },
    {
      key: 'logger',
      label: 'Logger',
      type: ConnectorConfigFormItemType.Switch,
      description: 'Enable logger to log SMTP operations.',
      required: false,
      defaultValue: false,
    },
    {
      key: 'debug',
      label: 'Debug',
      type: ConnectorConfigFormItemType.Switch,
      description: 'Enable debug mode to log SMTP operations in detail.',
      required: false,
      defaultValue: false,
    },
    {
      key: 'disableFileAccess',
      label: 'Disable File Access',
      type: ConnectorConfigFormItemType.Switch,
      description: 'Disable file access for security reasons.',
      required: false,
      defaultValue: false,
    },
    {
      key: 'disableUrlAccess',
      label: 'Disable URL Access',
      type: ConnectorConfigFormItemType.Switch,
      description: 'Disable URL access for security reasons.',
      required: false,
      defaultValue: false,
    },
    {
      key: 'name',
      label: 'Name',
      type: ConnectorConfigFormItemType.Text,
      required: false,
      placeholder: '<Logto-SMTP>',
    },
    {
      key: 'localAddress',
      label: 'Local Address',
      type: ConnectorConfigFormItemType.Text,
      required: false,
      placeholder: '<local_address>',
    },
    {
      key: 'connectionTimeout',
      label: 'Connection Timeout',
      type: ConnectorConfigFormItemType.Number,
      required: false,
      placeholder: '2 * 60 * 1000 (default is 2 minutes)',
    },
    {
      key: 'greetingTimeout',
      label: 'Greeting Timeout',
      type: ConnectorConfigFormItemType.Number,
      required: false,
      placeholder: '30 * 1000 (default is 30 seconds)',
    },
    {
      key: 'socketTimeout',
      label: 'Socket Timeout',
      type: ConnectorConfigFormItemType.Number,
      required: false,
      placeholder: '10 * 60 * 1000 (default is 10 minutes)',
    },
    {
      key: 'dnsTimeout',
      label: 'DNS Timeout',
      type: ConnectorConfigFormItemType.Number,
      required: false,
      placeholder: '30 * 1000 (default is 30 seconds)',
    },
    {
      key: 'secure',
      label: 'Secure',
      type: ConnectorConfigFormItemType.Switch,
      defaultValue: false,
    },
    {
      key: 'tls',
      label: 'TLS',
      type: ConnectorConfigFormItemType.Json,
      required: false,
      defaultValue: {},
    },
    {
      key: 'servername',
      label: 'Servername',
      type: ConnectorConfigFormItemType.Text,
      required: false,
      placeholder: '<servername>',
    },
    {
      key: 'ignoreTLS',
      label: 'Ignore TLS',
      type: ConnectorConfigFormItemType.Switch,
      required: false,
    },
    {
      key: 'requireTLS',
      label: 'Require TLS',
      type: ConnectorConfigFormItemType.Switch,
      required: false,
    },
    {
      key: 'customHeaders',
      label: 'Custom Headers',
      type: ConnectorConfigFormItemType.Json,
      required: false,
      defaultValue: {},
      description:
        'Custom headers to be added to original email headers when sending messages. Both keys and values should be string-typed.',
    },
  ],
};
