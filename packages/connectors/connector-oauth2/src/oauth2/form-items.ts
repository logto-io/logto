import { type ConnectorConfigFormItem, ConnectorConfigFormItemType } from '@logto/connector-kit';

import { TokenEndpointAuthMethod, ClientSecretJwtSigningAlgorithm } from './types.js';

export const authorizationEndpointFormItem: ConnectorConfigFormItem = Object.freeze({
  key: 'authorizationEndpoint',
  label: 'Authorization Endpoint',
  type: ConnectorConfigFormItemType.Text,
  required: true,
  placeholder: '<authorization-endpoint>',
});

export const tokenEndpointFormItem: ConnectorConfigFormItem = Object.freeze({
  key: 'tokenEndpoint',
  label: 'Token Endpoint',
  type: ConnectorConfigFormItemType.Text,
  required: true,
  placeholder: '<token-endpoint>',
});

export const clientIdFormItem: ConnectorConfigFormItem = Object.freeze({
  key: 'clientId',
  label: 'Client ID',
  type: ConnectorConfigFormItemType.Text,
  required: true,
  placeholder: '<client-id>',
});

export const clientSecretFormItem: ConnectorConfigFormItem = Object.freeze({
  key: 'clientSecret',
  label: 'Client Secret',
  type: ConnectorConfigFormItemType.Text,
  required: true,
  placeholder: '<client-secret>',
});

export const tokenEndpointAuthOptionsFormItems: ConnectorConfigFormItem[] = [
  Object.freeze({
    key: 'tokenEndpointAuthMethod',
    label: 'Token Endpoint Auth Method',
    type: ConnectorConfigFormItemType.Select,
    selectItems: [
      {
        title: TokenEndpointAuthMethod.ClientSecretPost,
        value: TokenEndpointAuthMethod.ClientSecretPost,
      },
      {
        title: TokenEndpointAuthMethod.ClientSecretBasic,
        value: TokenEndpointAuthMethod.ClientSecretBasic,
      },
      {
        title: TokenEndpointAuthMethod.ClientSecretJwt,
        value: TokenEndpointAuthMethod.ClientSecretJwt,
      },
    ],
    required: true,
    defaultValue: TokenEndpointAuthMethod.ClientSecretPost,
    description: 'The method used for client authentication at the token endpoint in OAuth 2.0.',
  }),
  Object.freeze({
    key: 'clientSecretJwtSigningAlgorithm',
    label: 'Client Secret JWT Signing Algorithm',
    type: ConnectorConfigFormItemType.Select,
    selectItems: [
      {
        title: ClientSecretJwtSigningAlgorithm.HS256,
        value: ClientSecretJwtSigningAlgorithm.HS256,
      },
      {
        title: ClientSecretJwtSigningAlgorithm.HS384,
        value: ClientSecretJwtSigningAlgorithm.HS384,
      },
      {
        title: ClientSecretJwtSigningAlgorithm.HS512,
        value: ClientSecretJwtSigningAlgorithm.HS512,
      },
    ],
    showConditions: [
      {
        targetKey: 'tokenEndpointAuthMethod',
        expectValue: TokenEndpointAuthMethod.ClientSecretJwt,
      },
    ],
    required: true,
    defaultValue: ClientSecretJwtSigningAlgorithm.HS256,
    description: 'The signing algorithm used for the client secret JWT.',
  }),
];

export const scopeFormItem: ConnectorConfigFormItem = Object.freeze({
  key: 'scope',
  label: 'Scope',
  type: ConnectorConfigFormItemType.Text,
  required: false,
  placeholder: '<space-delimited-scope>',
});
