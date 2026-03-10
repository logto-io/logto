import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

// WhatsApp Cloud API endpoint
// {{phoneNumberId}} will be replaced with the actual Phone Number ID from Meta
export const endpoint = 'https://graph.facebook.com/v19.0/{{phoneNumberId}}/messages';

export const defaultMetadata: ConnectorMetadata = {
  id: 'whatsapp-short-message-service',
  target: 'whatsapp-sms',
  platform: null,
  name: {
    en: 'WhatsApp Service',
    'zh-CN': 'WhatsApp 短信服务',
    'tr-TR': 'WhatsApp Servisi',
    ko: 'WhatsApp 서비스',
    es: 'Servicio de WhatsApp',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Send OTP verification codes via WhatsApp using the Meta Cloud API.',
    'zh-CN': '通过 Meta Cloud API 使用 WhatsApp 发送 OTP 验证码。',
    'tr-TR': "Meta Cloud API'yi kullanarak WhatsApp üzerinden OTP doğrulama kodları gönderin.",
    ko: 'Meta Cloud API를 사용하여 WhatsApp으로 OTP 인증 코드를 보냅니다.',
    es: 'Envía códigos de verificación OTP a través de WhatsApp utilizando la Meta Cloud API.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'accessToken',
      label: 'System User Access Token',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<your-meta-system-user-token>',
      description:
        'Generate a permanent token from a Meta Business System User with whatsapp_business_messaging and whatsapp_business_management permissions.',
    },
    {
      key: 'phoneNumberId',
      label: 'Phone Number ID',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<your-whatsapp-phone-number-id>',
    },
    {
      key: 'templates',
      label: 'Templates',
      type: ConnectorConfigFormItemType.Json,
      required: true,
      defaultValue: [
        {
          usageType: 'SignIn',
          templateName: 'logto_sign_in',
          language: 'en',
        },
        {
          usageType: 'Register',
          templateName: 'logto_register',
          language: 'en',
        },
        {
          usageType: 'ForgotPassword',
          templateName: 'logto_forgot_password',
          language: 'en',
        },
        {
          usageType: 'Generic',
          templateName: 'logto_generic',
          language: 'en',
        },
        {
          usageType: 'OrganizationInvitation',
          templateName: 'logto_generic',
          language: 'en',
        },
        {
          usageType: 'UserPermissionValidation',
          templateName: 'logto_generic',
          language: 'en',
        },
        {
          usageType: 'BindNewIdentifier',
          templateName: 'logto_generic',
          language: 'en',
        },
        {
          usageType: 'MfaVerification',
          templateName: 'logto_generic',
          language: 'en',
        },
        {
          usageType: 'BindMfa',
          templateName: 'logto_generic',
          language: 'en',
        },
      ],
    },
  ],
};
