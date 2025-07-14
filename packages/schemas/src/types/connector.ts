import { ConnectorType, connectorMetadataGuard } from '@logto/connector-kit';
import { z } from 'zod';

import { Connectors } from '../db-entries/index.js';

export type { ConnectorMetadata } from '@logto/connector-kit';
export { ConnectorType, ConnectorPlatform } from '@logto/connector-kit';

export const connectorResponseGuard = Connectors.guard
  .pick({
    id: true,
    syncProfile: true,
    enableTokenStorage: true,
    config: true,
    metadata: true,
    connectorId: true,
  })
  .merge(connectorMetadataGuard)
  .merge(
    z.object({
      type: z.nativeEnum(ConnectorType),
      isDemo: z.boolean().optional(),
      extraInfo: z.record(z.unknown()).optional(),
      usage: z.number().optional(),
    })
  );

export type ConnectorResponse = z.infer<typeof connectorResponseGuard>;

export const connectorFactoryResponseGuard = z
  .object({
    type: z.nativeEnum(ConnectorType), // Omit<BaseConnector<ConnectorType>, 'configGuard' | 'metadata'>
    isDemo: z.boolean().optional(),
  })
  .merge(connectorMetadataGuard);

export type ConnectorFactoryResponse = z.infer<typeof connectorFactoryResponseGuard>;
