import { z } from 'zod';

import { SsoConnectors } from '../db-entries/sso-connector.js';

/**
 * SSO Connector data type that are returned to the experience client for sign-in use.
 */
export const ssoConnectorMetadataGuard = z.object({
  id: z.string(),
  connectorName: z.string(),
  logo: z.string(),
  darkLogo: z.string().optional(),
});

export type SsoConnectorMetadata = z.infer<typeof ssoConnectorMetadataGuard>;

const ssoConnectorFactoryDetailGuard = z.object({
  providerName: z.string(),
  logo: z.string(),
  description: z.string(),
});

export type SsoConnectorFactoryDetail = z.infer<typeof ssoConnectorFactoryDetailGuard>;

export const ssoConnectorFactoriesResponseGuard = z.object({
  standardConnectors: z.array(ssoConnectorFactoryDetailGuard),
  providerConnectors: z.array(ssoConnectorFactoryDetailGuard),
});

export type SsoConnectorFactoriesResponse = z.infer<typeof ssoConnectorFactoriesResponseGuard>;

export const ssoConnectorWithProviderConfigGuard = SsoConnectors.guard.merge(
  z.object({
    providerLogo: z.string(),
    providerConfig: z.record(z.unknown()).optional(),
  })
);

export type SsoConnectorWithProviderConfig = z.infer<typeof ssoConnectorWithProviderConfigGuard>;
