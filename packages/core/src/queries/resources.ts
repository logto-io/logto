import { Resource, ResourceDBEntry, Resources } from '@logto/schemas';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import pool from '@/database/pool';
import { buildUpdateWhere } from '@/database/update-where';
import { convertToIdentifiers, OmitAutoSetFields } from '@/database/utils';
import RequestError from '@/errors/RequestError';

const { table, fields } = convertToIdentifiers(Resources);

export const findAllResources = async () =>
  pool.many<Resource>(sql`
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
  pool.maybeOne<Resource>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.identifier}=${indentifier}
  `);

export const findResourceById = async (id: string) =>
  pool.one<Resource>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.id}=${id}
  `);

export const insertResource = buildInsertInto<ResourceDBEntry, Resource>(pool, Resources, {
  returning: true,
});

const updateResource = buildUpdateWhere<ResourceDBEntry, Resource>(pool, Resources, true);

export const updateResourceById = async (
  id: string,
  set: Partial<OmitAutoSetFields<ResourceDBEntry>>
) => updateResource({ set, where: { id } });

export const deleteResourceById = async (id: string) => {
  const { rowCount } = await pool.query(sql`
    delete from ${table}
    where id=${id}
  `);
  if (rowCount < 1) {
    throw new RequestError({
      code: 'entity.not_exists_with_id',
      name: Resources.tableSingular,
      id,
      status: 404,
    });
  }
};
