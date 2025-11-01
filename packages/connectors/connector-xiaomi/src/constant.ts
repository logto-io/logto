import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorPlatform, ConnectorConfigFormItemType } from '@logto/connector-kit';

export const authorizationEndpoint = 'https://account.xiaomi.com/oauth2/authorize';
export const accessTokenEndpoint = 'https://account.xiaomi.com/oauth2/token';
export const userInfoEndpoint = 'https://open.account.xiaomi.com/user/profile';

// Default scope is read user profile
export const defaultScope = '1';

export const defaultMetadata: ConnectorMetadata = {
  id: 'xiaomi-universal',
  target: 'xiaomi',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'Xiaomi',
    'zh-CN': '小米',
    'tr-TR': 'Xiaomi',
    ko: 'Xiaomi',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Xiaomi is a Chinese electronics company.',
    'zh-CN': '小米是一家中国的电子产品公司。',
    'tr-TR': 'Xiaomi, Çin merkezli bir elektronik şirketidir.',
    ko: '샤오미는 중국의 전자 제품 회사입니다.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'clientId',
      type: ConnectorConfigFormItemType.Text,
      label: 'Client ID',
      required: true,
      placeholder: '<client-id>',
    },
    {
      key: 'clientSecret',
      type: ConnectorConfigFormItemType.Text,
      label: 'Client Secret',
      required: true,
      placeholder: '<client-secret>',
    },
    {
      key: 'scope',
      type: ConnectorConfigFormItemType.MultilineText,
      label: 'Scope',
      required: false,
      placeholder: 'Enter the scopes (separated by a space)',
      description: 'The scope determines permissions granted by the user.',
    },
    {
      key: 'skipConfirm',
      type: ConnectorConfigFormItemType.Switch,
      label: 'Skip Auth Confirm Page',
      required: false,
      description: 'Skip the Xiaomi auth confirm page when the user is already logged in.',
    },
  ],
};

export const defaultTimeout = 5000;
