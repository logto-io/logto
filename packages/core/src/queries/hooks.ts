import type { CreateHook, Hook } from '@logto/schemas';
import { Hooks } from '@logto/schemas';
import type { OmitAutoSetFields } from '@logto/shared';
import { convertToIdentifiers, manyRows } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';

const { table, fields } = convertToIdentifiers(Hooks);

export const createHooksQueries = (pool: CommonQueryMethods) => {
  const findAllHooks = async () =>
    manyRows(
      pool.query<Hook>(sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
      `)
    );

  const findHookById = buildFindEntityByIdWithPool(pool)<CreateHook, Hook>(Hooks);

  const insertHook = buildInsertIntoWithPool(pool)<CreateHook, Hook>(Hooks, {
    returning: true,
  });

  const updateHook = buildUpdateWhereWithPool(pool)<CreateHook, Hook>(Hooks, true);

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
    findAllHooks,
    findHookById,
    insertHook,
    updateHookById,
    deleteHookById,
  };
};
