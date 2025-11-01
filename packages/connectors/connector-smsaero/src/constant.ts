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
    'zh-CN':
      'SMS Aero 使用户无需查看合同即可在 5 分钟内开始使用短信群发，并为开发者提供带有易用类和 24x7 聊天支持的便捷 API。',
    'tr-TR':
      'SMS Aero, kullanıcıların sözleşmeyi incelemeden 5 dakika içinde SMS gönderimine başlamasını sağlar; geliştiricilere erişilebilir sınıflara ve 7/24 sohbet desteğine sahip kullanışlı bir API sunar.',
    ko: 'SMS Aero는 계약을 확인하지 않고도 5분 만에 SMS 발송을 시작할 수 있게 하며, 개발자에게는 사용하기 쉬운 클래스와 24시간 채팅 지원을 제공하는 편리한 API를 제공합니다.',
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
