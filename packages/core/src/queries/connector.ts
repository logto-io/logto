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
    order by ${fields.enabled} desc, ${fields.id} asc
  `);

export const findAllEnabledConnectors = async () =>
  pool.many<Connector>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.enabled} = true
    order by ${fields.id} asc
  `);

export const findConnectorById = async (id: string) =>
  pool.one<Connector>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.id}=${id}
  `);

export const insertConnector = buildInsertInto<CreateConnector, Connector>(pool, Connectors, {
  returning: true,
});

export const updateConnector = buildUpdateWhere<CreateConnector, Connector>(pool, Connectors, true);
