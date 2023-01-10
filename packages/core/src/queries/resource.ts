import type { Resource, CreateResource } from '@logto/schemas';
import { Resources } from '@logto/schemas';
import type { OmitAutoSetFields } from '@logto/shared';
import { convertToIdentifiers, conditionalSql, manyRows } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { getTotalRowCountWithPool } from '#src/database/row-count.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';

const { table, fields } = convertToIdentifiers(Resources);

export const createResourceQueries = (pool: CommonQueryMethods) => {
  const findTotalNumberOfResources = async () => getTotalRowCountWithPool(pool)(table);

  const findAllResources = async (limit?: number, offset?: number) =>
    manyRows(
      pool.query<Resource>(sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        ${conditionalSql(limit, (limit) => sql`limit ${limit}`)}
        ${conditionalSql(offset, (offset) => sql`offset ${offset}`)}
      `)
    );

  const findResourceByIndicator = async (indicator: string) =>
    pool.maybeOne<Resource>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.indicator}=${indicator}
    `);

  const findResourceById = buildFindEntityByIdWithPool(pool)<CreateResource, Resource>(Resources);

  const findResourcesByIds = async (resourceIds: string[]) =>
    resourceIds.length > 0
      ? pool.any<Resource>(sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where ${fields.id} in (${sql.join(resourceIds, sql`, `)})
      `)
      : [];

  const insertResource = buildInsertIntoWithPool(pool)<CreateResource, Resource>(Resources, {
    returning: true,
  });

  const updateResource = buildUpdateWhereWithPool(pool)<CreateResource, Resource>(Resources, true);

  const updateResourceById = async (
    id: string,
    set: Partial<OmitAutoSetFields<CreateResource>>,
    jsonbMode: 'replace' | 'merge' = 'merge'
  ) => updateResource({ set, where: { id }, jsonbMode });

  const deleteResourceById = async (id: string) => {
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.id}=${id}
    `);

    if (rowCount < 1) {
      throw new DeletionError(Resources.table, id);
    }
  };

  return {
    findTotalNumberOfResources,
    findAllResources,
    findResourceByIndicator,
    findResourceById,
    findResourcesByIds,
    insertResource,
    updateResource,
    updateResourceById,
    deleteResourceById,
  };
};
