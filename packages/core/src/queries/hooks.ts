import type { CreateHook } from '@logto/schemas';
import { Hooks } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { buildFindAllEntitiesWithPool } from '#src/database/find-all-entities.js';
import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { getTotalRowCountWithPool } from '#src/database/row-count.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import { convertToIdentifiers, type OmitAutoSetFields } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(Hooks);

export const createHooksQueries = (pool: CommonQueryMethods) => {
  const getTotalNumberOfHooks = async () => getTotalRowCountWithPool(pool)(table);

  const findAllHooks = buildFindAllEntitiesWithPool(pool)(Hooks, [
    { field: 'createdAt', order: 'desc' },
  ]);

  const findHookById = buildFindEntityByIdWithPool(pool)(Hooks);

  const insertHook = buildInsertIntoWithPool(pool)(Hooks, {
    returning: true,
  });

  const updateHook = buildUpdateWhereWithPool(pool)(Hooks, true);

  const updateHookById = async (
    id: string,
    set: Partial<OmitAutoSetFields<CreateHook>>,
    jsonbMode: 'replace' | 'merge' = 'merge'
  ) => updateHook({ set, where: { id }, jsonbMode });

  const deleteHookById = async (id: string) => {
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.id}=${id}
    `);

    if (rowCount < 1) {
      throw new DeletionError(Hooks.table, id);
    }
  };

  return {
    getTotalNumberOfHooks,
    findAllHooks,
    findHookById,
    insertHook,
    updateHookById,
    deleteHookById,
  };
};
