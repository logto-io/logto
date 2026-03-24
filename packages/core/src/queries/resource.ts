import type { Resource, CreateResource } from '@logto/schemas';
import { Resources } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { type WellKnownCache } from '#src/caches/well-known.js';
import { buildFindAllEntitiesWithPool } from '#src/database/find-all-entities.js';
import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { getTotalRowCountWithPool } from '#src/database/row-count.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { DeletionError, UpdateError } from '#src/errors/SlonikError/index.js';
import type { OmitAutoSetFields } from '#src/utils/sql.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(Resources);

export const createResourceQueries = (pool: CommonQueryMethods, wellKnownCache: WellKnownCache) => {
  const findTotalNumberOfResources = async () => getTotalRowCountWithPool(pool)(table);

  const findAllResources = buildFindAllEntitiesWithPool(pool)(Resources);

  const findResourceByIndicator = wellKnownCache.memoize(
    async (indicator: string) =>
      pool.maybeOne<Resource>(sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where ${fields.indicator}=${indicator}
      `),
    ['resource-by-indicator', (indicator) => indicator]
  );

  const findDefaultResource = async () =>
    pool.maybeOne<Resource>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.isDefault}=true
    `);

  const setDefaultResource = async (id: string) => {
    return pool.transaction(async (connection) => {
      await connection.query(sql`
        update ${table}
          set ${fields.isDefault}=false
          where ${fields.isDefault}=true;
      `);
      const returning = await connection.maybeOne<Resource>(sql`
        update ${table}
          set ${fields.isDefault}=true
          where ${fields.id}=${id}
          returning *;
      `);

      if (!returning) {
        throw new UpdateError(Resources, { set: { isDefault: true }, where: { id } });
      }

      return returning;
    });
  };

  const findResourceById = buildFindEntityByIdWithPool(pool)(Resources);

  const findResourcesByIds = async (resourceIds: string[]) =>
    resourceIds.length > 0
      ? pool.any<Resource>(sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where ${fields.id} in (${sql.join(resourceIds, sql`, `)})
      `)
      : [];

  const insertResource = wellKnownCache.mutate(
    buildInsertIntoWithPool(pool)(Resources, {
      returning: true,
    }),
    ['resource-by-indicator', ({ indicator }) => indicator]
  );

  const updateResource = buildUpdateWhereWithPool(pool)(Resources, true);

  const updateResourceById = async (
    id: string,
    set: Partial<OmitAutoSetFields<CreateResource>>,
    jsonbMode: 'replace' | 'merge' = 'merge'
  ) => {
    const previousResource = await findResourceById(id);
    const updatedResource = await updateResource({ set, where: { id }, jsonbMode });

    void Promise.all(
      [previousResource.indicator, updatedResource.indicator].map(async (indicator) =>
        trySafe(wellKnownCache.delete('resource-by-indicator', indicator))
      )
    );

    return updatedResource;
  };

  const deleteResourceById = async (id: string) => {
    const { indicator } = await findResourceById(id);
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.id}=${id}
    `);

    if (rowCount < 1) {
      throw new DeletionError(Resources.table, id);
    }

    void trySafe(wellKnownCache.delete('resource-by-indicator', indicator));
  };

  return {
    findTotalNumberOfResources,
    findAllResources,
    findResourceByIndicator,
    findDefaultResource,
    setDefaultResource,
    findResourceById,
    findResourcesByIds,
    insertResource,
    updateResource,
    updateResourceById,
    deleteResourceById,
  };
};
