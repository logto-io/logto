import type { Resource, CreateResource } from '@logto/schemas';
import { Resources } from '@logto/schemas';
import type { OmitAutoSetFields } from '@logto/shared';
import { convertToIdentifiers, conditionalSql, manyRows } from '@logto/shared';
import { sql } from 'slonik';

import { buildFindEntityById } from '@/database/find-entity-by-id';
import { buildInsertInto } from '@/database/insert-into';
import { getTotalRowCount } from '@/database/row-count';
import { buildUpdateWhere } from '@/database/update-where';
import envSet from '@/env-set';
import { DeletionError } from '@/errors/SlonikError';

const { table, fields } = convertToIdentifiers(Resources);

export const findTotalNumberOfResources = async () => getTotalRowCount(table);

export const findAllResources = async (limit: number, offset: number) =>
  manyRows(
    envSet.pool.query<Resource>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      ${conditionalSql(limit, (limit) => sql`limit ${limit}`)}
      ${conditionalSql(offset, (offset) => sql`offset ${offset}`)}
    `)
  );

export const findResourceByIndicator = async (indicator: string) =>
  envSet.pool.maybeOne<Resource>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.indicator}=${indicator}
  `);

export const findResourceById = buildFindEntityById<CreateResource, Resource>(Resources);

export const insertResource = buildInsertInto<CreateResource, Resource>(Resources, {
  returning: true,
});

const updateResource = buildUpdateWhere<CreateResource, Resource>(Resources, true);

export const updateResourceById = async (
  id: string,
  set: Partial<OmitAutoSetFields<CreateResource>>,
  jsonbMode: 'replace' | 'merge' = 'merge'
) => updateResource({ set, where: { id }, jsonbMode });

export const deleteResourceById = async (id: string) => {
  const { rowCount } = await envSet.pool.query(sql`
    delete from ${table}
    where ${fields.id}=${id}
  `);

  if (rowCount < 1) {
    throw new DeletionError(Resources.table, id);
  }
};
