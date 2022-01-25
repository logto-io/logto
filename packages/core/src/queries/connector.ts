import { Connector, CreateConnector, Connectors } from '@logto/schemas';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import pool from '@/database/pool';
import { buildUpdateWhere } from '@/database/update-where';
import { convertToIdentifiers } from '@/database/utils';

const { table, fields } = convertToIdentifiers(Connectors);

export const findAllConnectors = async () =>
  pool.many<Connector>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
  `);

export const findConnectorById = async (id: string) =>
  pool.one<Connector>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.id}=${id}
  `);

export const hasConnector = async (id: string) =>
  pool.exists(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.id}=${id}
  `);

export const insertConnector = buildInsertInto<CreateConnector, Connector>(pool, Connectors, {
  returning: true,
});

export const updateConnector = buildUpdateWhere<CreateConnector, Connector>(pool, Connectors, true);
