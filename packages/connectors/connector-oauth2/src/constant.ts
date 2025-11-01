import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType, ConnectorPlatform } from '@logto/connector-kit';

import {
  authorizationEndpointFormItem,
  clientIdFormItem,
  clientSecretFormItem,
  scopeFormItem,
  tokenEndpointAuthOptionsFormItems,
  tokenEndpointFormItem,
} from './oauth2/form-items.js';

export const defaultMetadata: ConnectorMetadata = {
  id: 'oauth2',
  target: 'oauth2',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'OAuth 2.0',
    'zh-CN': 'OAuth 2.0',
    'tr-TR': 'OAuth 2.0',
    ko: 'OAuth 2.0',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'The OAuth 2.0 authorization framework enables a third-party application to obtain limited access to an HTTP service.',
    'zh-CN': 'OAuth 2.0 授权框架使第三方应用能够以受限权限访问 HTTP 服务。',
    'tr-TR':
      'OAuth 2.0 yetkilendirme çerçevesi, üçüncü taraf bir uygulamanın bir HTTP hizmetine sınırlı erişim elde etmesini sağlar.',
    ko: 'OAuth 2.0 인증 프레임워크는 서드파티 애플리케이션이 HTTP 서비스에 제한된 접근 권한을 획득할 수 있도록 합니다.',
  },
  readme: './README.md',
  isStandard: true,
  formItems: [
    authorizationEndpointFormItem,
    tokenEndpointFormItem,
    {
      key: 'userInfoEndpoint',
      label: 'User Info Endpoint',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<user-info-endpoint>',
    },
    clientIdFormItem,
    clientSecretFormItem,
    ...tokenEndpointAuthOptionsFormItems,
    {
      key: 'tokenEndpointResponseType',
      label: 'Token Endpoint Response Type',
      type: ConnectorConfigFormItemType.Select,
      selectItems: [
        {
          title: 'query-string',
          value: 'query-string',
        },
        { title: 'json', value: 'json' },
      ],
      required: false,
      defaultValue: 'query-string',
    },
    scopeFormItem,
    {
      key: 'profileMap',
      label: 'Profile Map',
      type: ConnectorConfigFormItemType.Json,
      required: false,
      defaultValue: {
        id: 'user_id',
        email: 'email_verified',
        phone: 'phone_verified',
        name: 'full_name',
        avatar: 'avatar_url',
      },
    },
    {
      key: 'customConfig',
      label: 'Custom Config',
      type: ConnectorConfigFormItemType.Json,
      required: false,
      defaultValue: {},
    },
  ],
  isTokenStorageSupported: true,
};

export const defaultTimeout = 5000;
