import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

export const defaultMetadata: ConnectorMetadata = {
  id: 'smtp-sms',
  target: 'smtp-sms',
  platform: null,
  name: {
    en: 'SMTP SMS',
    'zh-CN': 'SMTP 短信',
    'tr-TR': 'SMTP SMS',
    ko: 'SMTP SMS',
  },
  logo: './logo.svg',
  logoDark: './logo-dark.svg',
  description: {
    en: 'Custom connector by Service Vic. Send SMS messages via an email-to-SMS SMTP gateway. Many mobile carriers provide an email address that forwards to a subscriber\'s phone as an SMS (e.g. number@txt.att.net).',
    'zh-CN': '由 Service Vic 定制开发。通过邮件转短信 SMTP 网关发送短信。',
    'tr-TR': 'Service Vic tarafından özel geliştirilmiş. E-postadan SMS\'e SMTP ağ geçidi aracılığıyla SMS gönderin.',
    ko: 'Service Vic의 커스텀 커넥터. 이메일-SMS SMTP 게이트웨이를 통해 SMS 메시지를 보냅니다.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'host',
      label: 'Host',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: 'smtp.example.com',
    },
    {
      key: 'port',
      label: 'Port',
      type: ConnectorConfigFormItemType.Number,
      required: true,
      placeholder: '587',
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
      placeholder: 'notifications@example.com',
    },
    {
      key: 'toEmailTemplate',
      label: 'To Email Template',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '{{phoneNumberOnly}}@txt.att.net',
      tooltip:
        'Template for deriving the gateway email address from the phone number. Use {{phone}} for the raw number (e.g. +12025551234) or {{phoneNumberOnly}} for digits only (e.g. 12025551234).',
    },
    {
      key: 'subject',
      label: 'Email Subject',
      type: ConnectorConfigFormItemType.Text,
      required: false,
      placeholder: 'Verification Code',
      tooltip: 'Optional email subject. Most SMS gateways ignore this field.',
    },
    {
      key: 'templates',
      label: 'Templates',
      type: ConnectorConfigFormItemType.Json,
      required: true,
      defaultValue: [
        {
          usageType: 'SignIn',
          content: 'Your Logto sign-in verification code is {{code}}. Expires in 10 minutes.',
        },
        {
          usageType: 'Register',
          content: 'Your Logto sign-up verification code is {{code}}. Expires in 10 minutes.',
        },
        {
          usageType: 'ForgotPassword',
          content:
            'Your Logto password reset verification code is {{code}}. Expires in 10 minutes.',
        },
        {
          usageType: 'OrganizationInvitation',
          content: 'Your Logto organization invitation code is {{code}}. Expires in 10 minutes.',
        },
        {
          usageType: 'Generic',
          content: 'Your Logto verification code is {{code}}. Expires in 10 minutes.',
        },
      ],
    },
    {
      key: 'secure',
      label: 'Secure (TLS)',
      type: ConnectorConfigFormItemType.Switch,
      defaultValue: false,
      description: 'Use TLS when connecting to the SMTP server. Enable for port 465.',
    },
    {
      key: 'tls',
      label: 'TLS Options',
      type: ConnectorConfigFormItemType.Json,
      required: false,
      defaultValue: {},
    },
    {
      key: 'servername',
      label: 'Servername',
      type: ConnectorConfigFormItemType.Text,
      required: false,
      placeholder: 'smtp.example.com',
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
      key: 'connectionTimeout',
      label: 'Connection Timeout (ms)',
      type: ConnectorConfigFormItemType.Number,
      required: false,
      placeholder: '120000',
    },
    {
      key: 'greetingTimeout',
      label: 'Greeting Timeout (ms)',
      type: ConnectorConfigFormItemType.Number,
      required: false,
      placeholder: '30000',
    },
    {
      key: 'socketTimeout',
      label: 'Socket Timeout (ms)',
      type: ConnectorConfigFormItemType.Number,
      required: false,
      placeholder: '600000',
    },
  ],
};
