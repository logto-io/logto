import type { Connector, CreateConnector } from '@logto/schemas';
import { Connectors } from '@logto/schemas';
import { convertToIdentifiers, manyRows } from '@logto/shared';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import { buildUpdateWhere } from '@/database/update-where';
import envSet from '@/env-set';

const { table, fields } = convertToIdentifiers(Connectors);

export const findAllConnectors = async () =>
  manyRows(
    envSet.pool.query<Connector>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      order by ${fields.enabled} desc, ${fields.id} asc
    `)
  );

export const countConnectorByConnectorId = async (connectorId: string) =>
  envSet.pool.one<{ count: number }>(sql`
    select count(*)
    from ${table}
    where ${fields.connectorId}=${connectorId}
  `);

export const hasConnectorWithId = async (id: string) =>
  envSet.pool.exists(sql`
    select ${fields.id}
    from ${table}
    where ${fields.id}=${id}
  `);

export const insertConnector = buildInsertInto<CreateConnector, Connector>(Connectors, {
  returning: true,
});

export const updateConnector = buildUpdateWhere<CreateConnector, Connector>(Connectors, true);
