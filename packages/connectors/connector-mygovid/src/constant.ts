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
  id: 'mygovid',
  target: 'mygovid',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'MyGovId',
    'zh-CN': 'MyGovId',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'MyGovId connector',
    'zh-CN': 'MyGovId connector',
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
