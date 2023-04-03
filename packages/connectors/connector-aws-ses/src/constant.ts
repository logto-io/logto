import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

export const defaultMetadata: ConnectorMetadata = {
  id: 'aws-ses-mail',
  target: 'aws-ses',
  platform: null,
  name: {
    en: 'AWS Direct Mail',
    'zh-CN': 'AWS邮件推送',
    'tr-TR': 'AWS Direct Mail',
    ko: 'AWS 다이렉트 메일',
  },
  logo: './logo.svg',
  logoDark: './logo-dark.svg',
  description: {
    en: 'Amazon SES is a cloud email service provider that can integrate into any application for bulk email sending.',
    'zh-CN':
      'Amazon SES 是云电子邮件发送服务提供商，它可以集成到任何应用程序中，用于批量发送电子邮件。',
    'tr-TR':
      'Amazon SES, toplu e-posta dağıtımı için herhangi bir uygulamaya entegre edilebilen bir bulut e-posta dağıtım hizmeti sağlayıcısıdır.',
    ko: 'Amazon SES는 모든 애플리케이션에 통합하여 대량으로 이메일을 전송할 수 있는 클라우드 이메일 서비스 공급자입니다.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'accessKeyId',
      label: 'Access Key ID',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<access-key-id>',
    },
    {
      key: 'accessKeySecret',
      label: 'Access Key Secret',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<access-key-secret>',
    },
    {
      key: 'region',
      label: 'Region',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<region>',
    },
    {
      key: 'emailAddress',
      label: 'Email Address',
      type: ConnectorConfigFormItemType.Text,
      required: false,
      placeholder: '<email-address>',
    },
    {
      key: 'emailAddressIdentityArn',
      label: 'Email Address Identity ARN',
      type: ConnectorConfigFormItemType.Text,
      required: false,
      placeholder: '<email-address-identity-arn>',
    },
    {
      key: 'feedbackForwardingEmailAddress',
      label: 'Feedback Forwarding Email Address',
      type: ConnectorConfigFormItemType.Text,
      required: false,
      placeholder: '<feedback-forwarding-email-address>',
    },
    {
      key: 'feedbackForwardingEmailAddressIdentityArn',
      label: 'Feedback Forwarding Email Address Identity ARN',
      type: ConnectorConfigFormItemType.Text,
      required: false,
      placeholder: '<feedback-forwarding-email-address-identity-arn>',
    },
    {
      key: 'configurationSetName',
      label: 'Configuration Set Name',
      type: ConnectorConfigFormItemType.Text,
      required: false,
      placeholder: '<configuration-set-name>',
    },
    {
      key: 'templates',
      label: 'Templates',
      type: ConnectorConfigFormItemType.Json,
      required: true,
      defaultValue: [
        {
          usageType: 'SignIn',
          subject: '<sign-in-template-subject>',
          content:
            'Your Logto sign-in verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'Register',
          subject: '<register-template-subject>',
          content:
            'Your Logto sign-up verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'ForgotPassword',
          subject: '<forgot-password-template-subject>',
          content:
            'Your Logto password change verification code is {{code}}. The code will remain active for 10 minutes.',
        },
        {
          usageType: 'Generic',
          subject: '<generic-template-subject>',
          content:
            'Your Logto verification code is {{code}}. The code will remain active for 10 minutes.',
        },
      ],
    },
  ],
};
