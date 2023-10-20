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
