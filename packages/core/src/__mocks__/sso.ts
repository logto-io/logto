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
  ssoOnly: true,
  createdAt: Date.now(),
} satisfies SsoConnector;
