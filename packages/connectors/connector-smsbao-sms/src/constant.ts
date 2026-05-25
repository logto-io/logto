import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

export const endpoint = 'https://api.smsbao.com/sms';

const defaultTemplateContent = '您的验证码是 {{code}}。如非本人操作，请忽略本短信';

export const defaultMetadata: ConnectorMetadata = {
  id: 'smsbao-sms',
  target: 'smsbao-sms',
  platform: null,
  name: {
    en: 'SMSBao SMS Service',
    'zh-CN': '短信宝短信服务',
    zh: '短信宝短信服务',
  },
  logo: './logo.png',
  logoDark: null,
  description: {
    en: 'SMSBao is an SMS service provider.',
    'zh-CN': '短信宝是一家短信服务提供商。',
    zh: '短信宝是一家短信服务提供商。',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'username',
      label: 'Username',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<username>',
    },
    {
      key: 'passwordOrApiKey',
      label: 'API Key or MD5 Password',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<api-key-or-md5-password>',
    },
    {
      key: 'goodsId',
      label: 'Product ID',
      description: 'Optional SMSBao dedicated channel product ID.',
      type: ConnectorConfigFormItemType.Text,
      required: false,
      placeholder: '<product-id>',
    },
    {
      key: 'templates',
      label: 'SMS Templates',
      type: ConnectorConfigFormItemType.Json,
      required: true,
      defaultValue: [
        {
          usageType: 'SignIn',
          content: defaultTemplateContent,
        },
        {
          usageType: 'Register',
          content: defaultTemplateContent,
        },
        {
          usageType: 'ForgotPassword',
          content: defaultTemplateContent,
        },
        {
          usageType: 'OrganizationInvitation',
          content: defaultTemplateContent,
        },
        {
          usageType: 'Generic',
          content: defaultTemplateContent,
        },
        {
          usageType: 'UserPermissionValidation',
          content: defaultTemplateContent,
        },
        {
          usageType: 'BindNewIdentifier',
          content: defaultTemplateContent,
        },
        {
          usageType: 'MfaVerification',
          content: defaultTemplateContent,
        },
        {
          usageType: 'BindMfa',
          content: defaultTemplateContent,
        },
      ],
    },
  ],
};
