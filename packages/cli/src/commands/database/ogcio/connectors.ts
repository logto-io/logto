/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @silverhand/fp/no-mutating-methods */

import { Connectors } from '@logto/schemas';
import { sql, type DatabaseTransactionConnection } from '@silverhand/slonik';

import { type ConnectorSeeder } from './ogcio-seeder.js';
import { createItemWithoutId } from './queries.js';

type SeedingConnector = {
  tenant_id: string;
  id: string;
  sync_profile: boolean;
  connector_id: string;
  config: string;
  metadata: string;
};

const createConnector = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  connectorToSeed: SeedingConnector
) =>
  createItemWithoutId({
    transaction,
    tenantId,
    toInsert: connectorToSeed,
    toLogFieldName: 'id',
    whereClauses: [sql`id = ${connectorToSeed.id}`],
    tableName: Connectors.table,
    columnToGet: 'id',
  });

const fillConnectors = (
  inputConnectors: ConnectorSeeder[],
  tenantId: string
): SeedingConnector[] => {
  return inputConnectors.map((connector) => ({
    tenant_id: tenantId,
    id: connector.id,
    sync_profile: connector.sync_profile,
    connector_id: connector.connector_id,
    config: JSON.stringify(connector.config),
    metadata: JSON.stringify(connector.metadata),
  }));
};

export const seedConnectors = async (params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  connectors: ConnectorSeeder[];
}) => {
  const connectorsToCreate = fillConnectors(params.connectors, params.tenantId);
  const queries: Array<Promise<SeedingConnector>> = [];
  for (const element of connectorsToCreate) {
    queries.push(createConnector(params.transaction, params.tenantId, element));
  }

  await Promise.all(queries);
  return connectorsToCreate;
};
