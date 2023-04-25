import type { BaseConnector, ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorType, connectorMetadataGuard } from '@logto/connector-kit';
import { z } from 'zod';

import type { Connector } from '../db-entries/index.js';

export type { ConnectorMetadata } from '@logto/connector-kit';
export { ConnectorType, ConnectorPlatform } from '@logto/connector-kit';

export type ConnectorResponse = Pick<
  Connector,
  'id' | 'syncProfile' | 'config' | 'metadata' | 'connectorId'
> &
  Omit<BaseConnector<ConnectorType>, 'configGuard' | 'metadata'> &
  ConnectorMetadata & { isDemo?: boolean };

export const connectorFactoryResponseGuard = z
  .object({
    type: z.nativeEnum(ConnectorType), // Omit<BaseConnector<ConnectorType>, 'configGuard' | 'metadata'>
    isDemo: z.boolean().optional(),
  })
  .merge(connectorMetadataGuard);

export type ConnectorFactoryResponse = z.infer<typeof connectorFactoryResponseGuard>;
