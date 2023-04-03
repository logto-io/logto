import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType, ConnectorPlatform } from '@logto/connector-kit';

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
    {
      key: 'authorizationEndpoint',
      label: 'Authorization Endpoint',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<authorization-endpoint>',
    },
    {
      key: 'tokenEndpoint',
      label: 'Token Endpoint',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<token-endpoint>',
    },
    {
      key: 'userInfoEndpoint',
      label: 'User Info Endpoint',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<user-info-endpoint>',
    },
    {
      key: 'clientId',
      label: 'Client ID',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<client-id>',
    },
    {
      key: 'clientSecret',
      label: 'Client Secret',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<client-secret>',
    },
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
    {
      key: 'scope',
      label: 'Scope',
      type: ConnectorConfigFormItemType.Text,
      required: false,
      placeholder: '<space-delimited-scope>',
    },
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
