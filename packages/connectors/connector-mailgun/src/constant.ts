import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

export const endpoint = 'https://api.sendgrid.com/v3/mail/send';

export const defaultMetadata: ConnectorMetadata = {
  id: 'mailgun-email',
  target: 'mailgun-email',
  platform: null,
  name: {
    en: 'Mailgun',
  },
  logo: './logo.png',
  logoDark: null,
  description: {
    en: 'Mailgun is an email delivery service for sending, receiving, and tracking emails.',
    'zh-CN': 'Mailgun 是一款用于发送、接收和跟踪电子邮件的邮件投递服务。',
    'tr-TR':
      'Mailgun, e-postaları gönderme, alma ve izleme için kullanılan bir e-posta teslim hizmetidir.',
    ko: 'Mailgun은 이메일을 발송하고 수신하며 추적할 수 있는 이메일 전송 서비스입니다.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'endpoint',
      label: 'Mailgun endpoint',
      type: ConnectorConfigFormItemType.Text,
      required: false,
      placeholder: 'https://api.mailgun.net',
    },
    {
      key: 'domain',
      label: 'Domain',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: 'your-mailgun-domain.com',
    },
    {
      key: 'apiKey',
      label: 'API Key',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<your-mailgun-api-key>',
    },
    {
      key: 'from',
      label: 'Email address to send from',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: 'Sender Name <foo@example.com>',
    },
    {
      key: 'deliveries',
      label: 'Deliveries',
      type: ConnectorConfigFormItemType.Json,
      required: true,
      defaultValue: {
        SignIn: {
          subject: 'Logto sign-in template {{code}}',
          html: 'Your Logto sign-in verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        Register: {
          subject: 'Logto sign-up template {{code}}',
          html: 'Your Logto sign-up verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        ForgotPassword: {
          subject: 'Logto reset password template {{code}}',
          html: 'Your Logto reset password verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        Generic: {
          subject: 'Logto generic template {{code}}',
          html: 'Your Logto generic verification code is {{code}}. The code will remain active for 10 minutes.',
        },
      },
    },
  ],
};
