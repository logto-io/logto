import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

export const endpoint = 'https://dm.aliyuncs.com/';

export const staticConfigs = {
  Format: 'json',
  SignatureMethod: 'HMAC-SHA1',
  SignatureVersion: '1.0',
  Version: '2015-11-23',
};

export const defaultMetadata: ConnectorMetadata = {
  id: 'aliyun-direct-mail',
  target: 'aliyun-dm',
  platform: null,
  name: {
    en: 'Aliyun Direct Mail',
    'zh-CN': '阿里云邮件推送',
    'tr-TR': 'Aliyun Direct Mail',
    ko: 'Aliyun 다이렉트 메일',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Aliyun provides cloud computing services to online businesses.',
    'zh-CN': '阿里云是全球性的云服务提供商。',
    'tr-TR': 'Aliyun, çevrimiçi işletmelere bulut bilişim hizmetleri sunmaktadır.',
    ko: 'Aliyun는 온라인 비지니스를 위해 클라우딩 컴퓨팅 서비스를 제공합니다.',
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
      key: 'accountName',
      label: 'Account Name',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<account-name>',
    },
    {
      key: 'fromAlias',
      label: 'From Alias',
      type: ConnectorConfigFormItemType.Text,
      required: false,
      placeholder: '<from-alias>',
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
