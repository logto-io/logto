import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';

export const defaultMetadata: ConnectorMetadata = {
  id: 'tencent-short-message-service',
  target: 'tencent-sms',
  platform: null,
  name: {
    en: 'Tencent Short Message Service',
    'zh-CN': '腾讯云短信服务',
    'tr-TR': 'Tencent SMS Servisi',
    ko: 'Tencent Short 메세지 서비스',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Tencent provides cloud computing services to online businesses.',
    'zh-CN': '腾讯云是全球性的云服务提供商。',
    'tr-TR': 'Tencent, çevrimiçi işletmelere bulut bilişim hizmetleri sunmaktadır.',
    ko: 'Tencent 는 온라인 비지니스를 위해 클라우딩 컴퓨팅 서비스를 제공합니다.',
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
      key: 'signName',
      label: 'Sign Name',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<sign-name>',
    },
    {
      key: 'sdkAppId',
      label: 'SDK App ID',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<sdk-app-id>',
    },
    {
      key: 'region',
      label: 'Region',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<region>',
    },
    {
      key: 'templates',
      label: 'Templates',
      type: ConnectorConfigFormItemType.Json,
      required: true,
      defaultValue: [
        {
          usageType: 'SignIn',
          templateCode: '<template-code>',
        },
        {
          usageType: 'Register',
          templateCode: '<template-code>',
        },
        {
          usageType: 'ForgotPassword',
          templateCode: '<template-code>',
        },
        {
          usageType: 'Generic',
          templateCode: '<template-code>',
        },
      ],
    },
  ],
};
