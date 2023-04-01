import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType, ConnectorPlatform } from '@logto/connector-kit';

export const defaultMetadata: ConnectorMetadata = {
  id: 'oidc',
  target: 'oidc',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'OIDC',
    'zh-CN': 'OIDC',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'OpenID Connect 1.0 is a simple identity layer on top of the OAuth 2.0 protocol.',
    'zh-CN': 'OpenID Connect 1.0 是基于 OAuth 2.0 协议的一个简单身份层。',
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
      key: 'scope',
      label: 'Scope',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<scope>',
    },
    {
      key: 'idTokenVerificationConfig',
      label: 'ID Token Verification Config',
      type: ConnectorConfigFormItemType.Json,
      required: true,
      defaultValue: {
        jwksUri: '<jwks-uri>',
      },
    },
    {
      key: 'authRequestOptionalConfig',
      label: 'Authentication Request Optional Config',
      type: ConnectorConfigFormItemType.Json,
      required: false,
      defaultValue: {},
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
