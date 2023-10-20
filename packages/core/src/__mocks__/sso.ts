import { type SsoConnector } from '@logto/schemas';

export const mockSsoConnector: SsoConnector = {
  id: 'mock-sso-connector',
  tenantId: 'mock-tenant',
  providerName: 'OIDC',
  connectorName: 'mock-connector-name',
  config: {},
  domains: [],
  branding: {},
  syncProfile: true,
  ssoOnly: true,
  createdAt: Date.now(),
};
