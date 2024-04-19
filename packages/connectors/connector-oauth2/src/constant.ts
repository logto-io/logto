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
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'The OAuth 2.0 authorization framework enables a third-party application to obtain limited access to an HTTP service.',
    'zh-CN': 'OAuth 2.0 授权框架是的第三方应用能够有权限访问 HTTP 服务。',
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
};

export const defaultTimeout = 5000;
