import type { Connector } from '@logto/schemas';
import { Connectors } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { type WellKnownCache } from '#src/caches/well-known.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import { type ConnectorWellKnown } from '#src/utils/connectors/types.js';
import { convertToIdentifiers, manyRows } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(Connectors);

export const createConnectorQueries = (
  pool: CommonQueryMethods,
  wellKnownCache: WellKnownCache
) => {
  const findAllConnectors = async () =>
    manyRows(
      pool.query<Connector>(sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        order by ${fields.id} asc
      `)
    );
  const findAllConnectorsWellKnown = wellKnownCache.memoize(
    async () =>
      manyRows(
        pool.query<ConnectorWellKnown>(sql`
          select ${sql.join([fields.id, fields.metadata, fields.connectorId], sql`, `)}
          from ${table}
          order by ${fields.id} asc
        `)
      ),
    ['connectors-well-known']
  );
  const findConnectorById = async (id: string) =>
    pool.one<Connector>(sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.id}=${id}
    `);
  const countConnectorByConnectorId = async (connectorId: string) =>
    pool.one<{ count: number }>(sql`
      select count(*)
      from ${table}
      where ${fields.connectorId}=${connectorId}
    `);
  const deleteConnectorById = wellKnownCache.mutate(
    async (id: string) => {
      const { rowCount } = await pool.query(sql`
        delete from ${table}
        where ${fields.id}=${id}
      `);

      if (rowCount < 1) {
        throw new DeletionError(Connectors.table, id);
      }
    },
    ['connectors-well-known']
  );
  const deleteConnectorByIds = wellKnownCache.mutate(
    async (ids: string[]) => {
      const { rowCount } = await pool.query(sql`
        delete from ${table}
        where ${fields.id} in (${sql.join(ids, sql`, `)})
      `);

      if (rowCount !== ids.length) {
        throw new DeletionError(Connectors.table, JSON.stringify({ ids }));
      }
    },
    ['connectors-well-known']
  );
  const insertConnector = wellKnownCache.mutate(
    buildInsertIntoWithPool(pool)(Connectors, {
      returning: true,
    }),
    ['connectors-well-known']
  );
  const updateConnector = wellKnownCache.mutate(buildUpdateWhereWithPool(pool)(Connectors, true), [
    'connectors-well-known',
  ]);

  return {
    findAllConnectors,
    /** Find all connectors from database with no sensitive info. */
    findAllConnectorsWellKnown,
    findConnectorById,
    countConnectorByConnectorId,
    deleteConnectorById,
    deleteConnectorByIds,
    insertConnector,
    updateConnector,
  };
};
