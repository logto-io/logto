import { SsoConnectors } from '@logto/schemas';
import { z } from 'zod';

import { SsoProviderName } from '#src/sso/types/index.js';

const connectorFactoryDetailGuard = z.object({
  providerName: z.nativeEnum(SsoProviderName),
  logo: z.string(),
  description: z.string(),
});

export type ConnectorFactoryDetail = z.infer<typeof connectorFactoryDetailGuard>;

export const connectorFactoriesResponseGuard = z.object({
  standardConnectors: z.array(connectorFactoryDetailGuard),
  providerConnectors: z.array(connectorFactoryDetailGuard),
});

export const ssoConnectorCreateGuard = SsoConnectors.createGuard
  .pick({
    config: true,
    domains: true,
    branding: true,
    syncProfile: true,
    ssoOnly: true,
  })
  // Provider name and connector name are required for creating a connector
  .merge(SsoConnectors.guard.pick({ providerName: true, connectorName: true }));

export const ssoConnectorWithProviderConfigGuard = SsoConnectors.guard.merge(
  z.object({
    providerLogo: z.string(),
    providerConfig: z.record(z.unknown()).optional(),
  })
);

export type SsoConnectorWithProviderConfig = z.infer<typeof ssoConnectorWithProviderConfigGuard>;
