import type { Connector } from '@logto/schemas';
import type { PostgreSql } from '@withtyped/postgres';
import { sql } from '@withtyped/postgres';
import type { Queryable } from '@withtyped/server';

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

  return { findAllConnectors };
};
