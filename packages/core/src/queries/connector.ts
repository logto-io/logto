import type { Connector, CreateConnector } from '@logto/schemas';
import { Connectors } from '@logto/schemas';
import { manyRows, convertToIdentifiers } from '@logto/shared';
import { sql } from 'slonik';

import { buildInsertInto } from '#src/database/insert-into.js';
import { buildUpdateWhere } from '#src/database/update-where.js';
import envSet from '#src/env-set/index.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';

const { table, fields } = convertToIdentifiers(Connectors);

export const findAllConnectors = async () =>
  manyRows(
    envSet.pool.query<Connector>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      order by ${fields.enabled} desc, ${fields.id} asc
    `)
  );

export const findConnectorById = async (id: string) =>
  envSet.pool.one<Connector>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.id}=${id}
  `);

export const countConnectorByConnectorId = async (connectorId: string) =>
  envSet.pool.one<{ count: number }>(sql`
    select count(*)
    from ${table}
    where ${fields.connectorId}=${connectorId}
  `);

export const deleteConnectorById = async (id: string) => {
  const { rowCount } = await envSet.pool.query(sql`
    delete from ${table}
    where ${fields.id}=${id}
  `);

  if (rowCount < 1) {
    throw new DeletionError(Connectors.table, id);
  }
};

export const deleteConnectorByIds = async (ids: string[]) => {
  const { rowCount } = await envSet.pool.query(sql`
    delete from ${table}
    where ${fields.id} in (${sql.join(ids, sql`, `)})
  `);

  if (rowCount !== ids.length) {
    throw new DeletionError(Connectors.table, JSON.stringify({ ids }));
  }
};

export const insertConnector = buildInsertInto<CreateConnector, Connector>(Connectors, {
  returning: true,
});

export const updateConnector = buildUpdateWhere<CreateConnector, Connector>(Connectors, true);
