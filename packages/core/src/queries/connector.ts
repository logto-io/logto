import { Connector, CreateConnector, Connectors } from '@logto/schemas';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import { buildUpdateWhere } from '@/database/update-where';
import { convertToIdentifiers, manyRows } from '@/database/utils';
import envSet from '@/env-set';

const { table, fields } = convertToIdentifiers(Connectors);

// eslint-disable-next-line @typescript-eslint/ban-types
const filterByPlatform = (platform: string | null) => {
  if (!platform) {
    return sql`${fields.platform} is null`;
  }

  return sql`${fields.platform}=${platform}`;
};

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
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.id}=${id}
  `);

export const findConnectorByTargetAndPlatform = async (
  target: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  platform: string | null
) =>
  envSet.pool.one<Connector>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.target}=${target} and ${filterByPlatform(platform)}
  `);

export const insertConnector = buildInsertInto<CreateConnector, Connector>(Connectors, {
  returning: true,
  onConflict: {
    fields: [fields.target, fields.platform],
    setExcludedFields: Object.values(fields),
  },
});

export const updateConnector = buildUpdateWhere<CreateConnector, Connector>(Connectors, true);
