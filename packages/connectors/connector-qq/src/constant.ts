import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorPlatform, ConnectorConfigFormItemType } from '@logto/connector-kit';

export const authorizationEndpoint = 'https://graph.qq.com/oauth2.0/authorize';
export const accessTokenEndpoint = 'https://graph.qq.com/oauth2.0/token';
export const userInfoEndpoint = 'https://graph.qq.com/user/get_user_info';
export const openIdEndpoint = 'https://graph.qq.com/oauth2.0/me';

export const defaultScope = 'get_user_info,get_unionId';

export const defaultMetadata: ConnectorMetadata = {
  id: 'qq-universal',
  target: 'qq',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'QQ',
    'zh-CN': 'QQ',
  },
  logo: './logo.svg',
  logoDark: './logo.svg',
  description: {
    en: 'QQ is a social platform by Tencent with over 600 million users.',
    'zh-CN': 'QQ是腾讯旗下拥有超过6亿用户的社交平台。',
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
      type: ConnectorConfigFormItemType.Text,
      label: 'Scope',
      required: false,
      placeholder: 'get_user_info,get_unionId',
      description: '逗号分隔的 scope 列表。如果不提供，默认为 "get_user_info,get_unionId"。',
    },
  ],
};

export const defaultTimeout = 5000;
