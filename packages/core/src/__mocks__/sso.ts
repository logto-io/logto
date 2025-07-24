import { type SsoConnector, SsoProviderName } from '@logto/schemas';

export const mockSsoConnector = {
  id: 'mock-sso-connector',
  tenantId: 'mock-tenant',
  providerName: SsoProviderName.OIDC,
  connectorName: 'mock-connector-name',
  config: {},
  domains: [],
  branding: {},
  syncProfile: true,
  enableTokenStorage: false,
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
  enableTokenStorage: false,
  createdAt: Date.now(),
} satisfies SsoConnector;

export const mockSamlSsoConnector = {
  id: 'mock-saml-sso-connector',
  tenantId: 'mock-tenant',
  providerName: SsoProviderName.SAML,
  connectorName: 'mock-connector-name',
  config: {
    metadata: 'mock-metadata',
  },
  domains: ['foo.com'],
  branding: {},
  syncProfile: true,
  enableTokenStorage: false,
  createdAt: Date.now(),
} satisfies SsoConnector;
