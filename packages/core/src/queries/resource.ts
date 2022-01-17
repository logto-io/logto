import { Resource, ResourceUpdate, Resources } from '@logto/schemas';
import { sql } from 'slonik';

import { buildFindMany } from '@/database/find-many';
import { buildInsertInto } from '@/database/insert-into';
import pool from '@/database/pool';
import { buildUpdateWhere } from '@/database/update-where';
import { convertToIdentifiers, OmitAutoSetFields, getTotalRowCount } from '@/database/utils';
import { DeletionError } from '@/errors/SlonikError';

const { table, fields } = convertToIdentifiers(Resources);

export const findTotalNumberOfResources = async () => getTotalRowCount(table);

const findResourcesMany = buildFindMany<ResourceUpdate, Resource>(pool, Resources);

export const findAllResources = async (limit: number, offset: number) =>
  findResourcesMany({ limit, offset });

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

export const insertResource = buildInsertInto<ResourceUpdate, Resource>(pool, Resources, {
  returning: true,
});

const updateResource = buildUpdateWhere<ResourceUpdate, Resource>(pool, Resources, true);

export const updateResourceById = async (
  id: string,
  set: Partial<OmitAutoSetFields<ResourceUpdate>>
) => updateResource({ set, where: { id } });

export const deleteResourceById = async (id: string) => {
  const { rowCount } = await pool.query(sql`
    delete from ${table}
    where id=${id}
  `);
  if (rowCount < 1) {
    throw new DeletionError();
  }
};
