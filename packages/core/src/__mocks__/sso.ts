import { type SsoConnector } from '@logto/schemas';

import { SsoProviderName } from '#src/sso/types/index.js';

export const mockSsoConnector = {
  id: 'mock-sso-connector',
  tenantId: 'mock-tenant',
  providerName: SsoProviderName.OIDC,
  connectorName: 'mock-connector-name',
  config: {},
  domains: [],
  branding: {},
  syncProfile: true,
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
  createdAt: Date.now(),
} satisfies SsoConnector;
