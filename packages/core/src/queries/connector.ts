import { Connector, CreateConnector, Connectors } from '@logto/schemas';
import { Nullable } from '@silverhand/essentials';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import { buildUpdateWhere } from '@/database/update-where';
import { convertToIdentifiers, manyRows } from '@/database/utils';
import envSet from '@/env-set';

const { table, fields } = convertToIdentifiers(Connectors);

const filterByPlatform = (platform: Nullable<string>) => {
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
  platform: Nullable<string>
) =>
  envSet.pool.one<Connector>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.target}=${target} and ${filterByPlatform(platform)}
  `);

export const insertConnector = buildInsertInto<CreateConnector, Connector>(Connectors, {
  returning: true,
});

export const updateConnector = buildUpdateWhere<CreateConnector, Connector>(Connectors, true);
