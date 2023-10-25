import { type SsoConnector } from '@logto/schemas';

import { SsoProviderName } from '#src/sso/types/index.js';
import { type BaseOidcConfig } from '#src/sso/types/oidc.js';
import { MetadataType } from '#src/sso/types/saml.js';
import { type BaseSamlConfig } from '#src/sso/types/saml.js';

export const mockSsoConnector = {
  id: 'mock-sso-connector',
  tenantId: 'mock-tenant',
  providerName: SsoProviderName.OIDC,
  connectorName: 'mock-connector-name',
  config: {},
  domains: [],
  branding: {},
  syncProfile: true,
  ssoOnly: true,
  createdAt: Date.now(),
} satisfies SsoConnector;

export const wellConfiguredSsoConnector = {
  id: 'mock-well-configured-sso-connector',
  tenantId: 'mock-tenant',
  providerName: SsoProviderName.OIDC,
  connectorName: 'mock-connector-name',
  config: {
    clientId: 'foo',
    clientSecret: 'bar',
    issuer: 'https://foo.com',
  },
  domains: ['foo.com'],
  branding: {},
  syncProfile: true,
  ssoOnly: true,
  createdAt: Date.now(),
} satisfies SsoConnector;

export const mockBaseSamlConfig = {
  metadataType: MetadataType.XML,
  metadataXml: 'metadataXml',
  attributeMapping: {},
  entityId: 'entityId',
  nameIdFormat: ['nameIdFormat'],
  signInEndpoint: 'signInEndpoint',
  signingAlgorithm: 'signingAlgorithm',
  x509Certificate: 'x509Certificate',
} satisfies BaseSamlConfig;

export const mockBaseOidcConfig = {
  authorizationEndpoint: 'authorizationEndpoint',
  tokenEndpoint: 'tokenEndpoint',
  userinfoEndpoint: 'userinfoEndpoint',
  jwksUri: 'jwksUri',
  issuer: 'issuer',
  clientId: 'clientId',
  clientSecret: 'clientSecret',
  scope: 'openid profile',
} satisfies BaseOidcConfig;
