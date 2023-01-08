import type { Resource, CreateResource } from '@logto/schemas';
import { Resources } from '@logto/schemas';
import type { OmitAutoSetFields } from '@logto/shared';
import { convertToIdentifiers, conditionalSql, manyRows } from '@logto/shared';
import { sql } from 'slonik';

import { buildFindEntityById } from '#src/database/find-entity-by-id.js';
import { buildInsertInto } from '#src/database/insert-into.js';
import { getTotalRowCount } from '#src/database/row-count.js';
import { buildUpdateWhere } from '#src/database/update-where.js';
import envSet from '#src/env-set/index.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';

const { table, fields } = convertToIdentifiers(Resources);

export const findTotalNumberOfResources = async () => getTotalRowCount(table);

export const findAllResources = async (limit?: number, offset?: number) =>
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

export const findResourcesByIds = async (resourceIds: string[]) =>
  resourceIds.length > 0
    ? envSet.pool.any<Resource>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.id} in (${sql.join(resourceIds, sql`, `)})
    `)
    : [];

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
