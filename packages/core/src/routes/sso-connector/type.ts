import { SsoConnectors } from '@logto/schemas';

export const ssoConnectorCreateGuard = SsoConnectors.createGuard
  .pick({
    config: true,
    domains: true,
    branding: true,
    syncProfile: true,
  })
  // Provider name and connector name are required for creating a connector
  .merge(SsoConnectors.guard.pick({ providerName: true, connectorName: true }));

export const ssoConnectorPatchGuard = SsoConnectors.guard
  .pick({
    config: true,
    domains: true,
    branding: true,
    syncProfile: true,
    connectorName: true,
  })
  .partial();
