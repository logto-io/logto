import type { CreateHook, Hook } from '@logto/schemas';
import { Hooks } from '@logto/schemas';
import type { OmitAutoSetFields } from '@logto/shared';
import { conditionalSql, convertToIdentifiers } from '@logto/shared';
import { sql } from 'slonik';

import { buildFindEntityById } from '@/database/find-entity-by-id';
import { buildInsertInto } from '@/database/insert-into';
import { getTotalRowCount } from '@/database/row-count';
import { buildUpdateWhere } from '@/database/update-where';
import envSet from '@/env-set';
import { DeletionError } from '@/errors/SlonikError';

const { table, fields } = convertToIdentifiers(Hooks);

export const findTotalNumberOfHooks = async () => getTotalRowCount(table);

export const insertHook = buildInsertInto<CreateHook, Hook>(Hooks, {
  returning: true,
});

export const findAllHooks = async (limit: number, offset: number) =>
  envSet.pool.any<Hook>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    ${conditionalSql(limit, (limit) => sql`limit ${limit}`)}
    ${conditionalSql(offset, (offset) => sql`offset ${offset}`)}
  `);

export const findHookById = buildFindEntityById<CreateHook, Hook>(Hooks);

const updateHook = buildUpdateWhere<CreateHook, Hook>(Hooks, true);

export const updateHookById = async (
  id: string,
  set: Partial<OmitAutoSetFields<CreateHook>>,
  jsonbMode: 'replace' | 'merge' = 'merge'
) => updateHook({ set, where: { id }, jsonbMode });

export const deleteHookById = async (id: string) => {
  const { rowCount } = await envSet.pool.query(sql`
    delete from ${table}
    where ${fields.id}=${id}
  `);

  if (rowCount < 1) {
    throw new DeletionError(Hooks.table, id);
  }
};
