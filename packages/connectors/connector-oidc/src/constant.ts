import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType, ConnectorPlatform } from '@logto/connector-kit';
import {
  tokenEndpointAuthOptionsFormItems,
  clientSecretFormItem,
  clientIdFormItem,
  tokenEndpointFormItem,
  authorizationEndpointFormItem,
  scopeFormItem,
} from '@logto/connector-oauth';

export const defaultMetadata: ConnectorMetadata = {
  id: 'oidc',
  target: 'oidc',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'OIDC',
    'zh-CN': 'OIDC',
    'tr-TR': 'OIDC',
    ko: 'OIDC',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'OpenID Connect 1.0 is a simple identity layer on top of the OAuth 2.0 protocol.',
    'zh-CN': 'OpenID Connect 1.0 是基于 OAuth 2.0 协议的一个简单身份层。',
    'tr-TR':
      'OpenID Connect 1.0, OAuth 2.0 protokolünün üzerine inşa edilmiş basit bir kimlik katmanıdır.',
    ko: 'OpenID Connect 1.0은 OAuth 2.0 프로토콜 위에 구축된 간단한 ID 계층입니다.',
  },
  readme: './README.md',
  isStandard: true,
  formItems: [
    authorizationEndpointFormItem,
    tokenEndpointFormItem,
    clientIdFormItem,
    clientSecretFormItem,
    ...tokenEndpointAuthOptionsFormItems,
    {
      ...scopeFormItem,
      required: true,
    },
    {
      key: 'acceptStringTypedBooleanClaims',
      label: 'Accept String-typed Boolean Claims',
      description:
        'Whether to accept string-typed boolean claims. For standard OIDC protocol, some claims such as `email_verified` and `phone_verified` are boolean-typed, but some providers may return them as string-typed. Enabling this option will convert string-typed boolean claims to boolean-typed.',
      type: ConnectorConfigFormItemType.Switch,
      required: false,
      defaultValue: false,
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
  isTokenStorageSupported: true,
};

export const defaultTimeout = 5000;
