import type { Connector, CreateConnector } from '@logto/schemas';
import type { PostgreSql } from '@withtyped/postgres';
import { sql } from '@withtyped/postgres';
import type { JsonObject, Queryable } from '@withtyped/server';

import { insertInto } from '#src/utils/query.js';

export type ConnectorsQuery = ReturnType<typeof createConnectorsQuery>;

export const createConnectorsQuery = (client: Queryable<PostgreSql>) => {
  const findAllConnectors = async (tenantId: string) => {
    const { rows } = await client.query<Connector>(sql`
      select id, sync_profile as "syncProfile",
        config, metadata, storage, connector_id as "connectorId",
        created_at as "createdAt"
      from connectors
      where tenant_id=${tenantId}
    `);

    return rows;
  };

  const insertConnector = async (
    // TODO @sijie update with-typed "JsonObject" to support "unknown" value
    connector: Pick<CreateConnector, 'id' | 'tenantId' | 'connectorId'> & { config: JsonObject }
  ) => client.query(insertInto(connector, 'connectors'));

  return { findAllConnectors, insertConnector };
};
