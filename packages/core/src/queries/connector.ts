import { Connector, ConnectorDBEntry, Connectors, ConnectorType } from '@logto/schemas';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import pool from '@/database/pool';
import { convertToIdentifiers } from '@/database/utils';

const { table, fields } = convertToIdentifiers(Connectors);

export const findConnectorByIdAndType = async (id: string, type: ConnectorType) =>
  pool.maybeOne<Connector>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.id}=${id} and ${fields.type}=${type}
  `);

export const insertConnector = buildInsertInto<ConnectorDBEntry, Connector>(pool, Connectors, {
  returning: true,
});
