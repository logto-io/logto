import { ResourceServerDBEntry, ResourceServers } from '@logto/schemas';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import pool from '@/database/pool';
import { buildUpdateWhere } from '@/database/update-where';
import { convertToIdentifiers, OmitAutoSetFields } from '@/database/utils';
import RequestError from '@/errors/RequestError';

const { table, fields } = convertToIdentifiers(ResourceServers);

export const findAllResources = async () =>
  pool.many<ResourceServerDBEntry>(sql`
  select ${sql.join(Object.values(fields), sql`,`)}
  from ${table}
  `);

export const hasResource = async (indentifier: string) =>
  pool.exists(sql`
  select ${fields.id}
  from ${table}
  where ${fields.identifier}=${indentifier}
`);

export const hasResourceWithId = async (id: string) =>
  pool.exists(sql`
  select ${fields.id}
  from ${table}
  where ${fields.id}=${id}
`);

export const findResourceByIdentifier = async (indentifier: string) =>
  pool.one<ResourceServerDBEntry>(sql`
  select ${sql.join(Object.values(fields), sql`,`)}
  from ${table}
  where ${fields.identifier}=${indentifier}
`);

export const findResourceById = async (id: string) =>
  pool.one<ResourceServerDBEntry>(sql`
  select ${sql.join(Object.values(fields), sql`,`)}
  from ${table}
  where ${fields.id}=${id}
`);

export const insertResource = buildInsertInto<ResourceServerDBEntry>(pool, ResourceServers, {
  returning: true,
});

const updateResource = buildUpdateWhere<ResourceServerDBEntry>(pool, ResourceServers, true);

export const updateResourceById = async (
  id: string,
  set: Partial<OmitAutoSetFields<ResourceServerDBEntry>>
) => updateResource({ set, where: { id } });

export const deleteResourceById = async (id: string) => {
  const { rowCount } = await pool.query(sql`
      delete from ${table}
      where id=${id}
    `);
  if (rowCount < 1) {
    throw new RequestError({
      code: 'entity.not_exists_with_id',
      name: ResourceServers.tableSingular,
      id,
      status: 404,
    });
  }
};
