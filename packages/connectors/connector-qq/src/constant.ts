import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorPlatform, ConnectorConfigFormItemType } from '@logto/connector-kit';

/**
 * QQ Connector Constants
 * These are the key API endpoints and default scopes used in the QQ OAuth 2.0 authorization flow.
 * @see https://wiki.connect.qq.com/%e5%87%86%e5%a4%87%e5%b7%a5%e4%bd%9c_oauth2-0
 */
// Get Authorization Code https://wiki.connect.qq.com/%e4%bd%bf%e7%94%a8authorization_code%e8%8e%b7%e5%8f%96access_token
export const authorizationEndpoint = 'https://graph.qq.com/oauth2.0/authorize';
// Obtain Access Token via Authorization Code https://wiki.connect.qq.com/%e4%bd%bf%e7%94%a8authorization_code%e8%8e%b7%e5%8f%96access_token
export const accessTokenEndpoint = 'https://graph.qq.com/oauth2.0/token';
// Get User Information https://wiki.connect.qq.com/openapi%e8%b0%83%e7%94%a8%e8%af%b4%e6%98%8e_oauth2-0
export const userInfoEndpoint = 'https://graph.qq.com/user/get_user_info';
// Get User OpenID & UnionID (OAuth 2.0)
// https://wiki.connect.qq.com/%e8%8e%b7%e5%8f%96%e7%94%a8%e6%88%b7openid_oauth2-0
// https://wiki.connect.qq.com/unionid%e4%bb%8b%e7%bb%8d
export const openIdEndpoint = 'https://graph.qq.com/oauth2.0/me';

// Default scopes for QQ OAuth 2.0
export const defaultScope = 'get_user_info,get_unionId';

export const defaultMetadata: ConnectorMetadata = {
  id: 'qq-universal',
  target: 'qq',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'QQ',
    'zh-CN': 'QQ',
    'tr-TR': 'QQ',
    ko: 'QQ',
  },
  logo: './logo.svg',
  logoDark: './logo.svg',
  description: {
    en: 'QQ is a social platform by Tencent with over 600 million users.',
    'zh-CN': 'QQ 是腾讯旗下拥有超过 6 亿用户的社交平台。',
    'tr-TR':
      'QQ, Tencent tarafından sunulan ve 600 milyondan fazla kullanıcıya sahip bir sosyal platformdur.',
    ko: 'QQ는 6억 명 이상의 사용자를 보유한 텐센트의 소셜 플랫폼입니다.',
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
      placeholder: 'get_user_info,get_unionId',
      description: '逗号分隔的 scope 列表。如果不提供，默认为 "get_user_info,get_unionId"。',
    },
  ],
};

export const defaultTimeout = 5000;
