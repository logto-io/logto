import { type SystemGuard, type SystemKey, Systems } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';
import { type z } from 'zod';

import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(Systems);

export const createSystemsQuery = (pool: CommonQueryMethods) => {
  const findSystemByKey = async (key: SystemKey) =>
    pool.maybeOne<Record<string, unknown>>(sql`
      select ${fields.value} from ${table}
      where ${fields.key} = ${key}
    `);

  /** Read the value of a system key and lock its row until the enclosing transaction ends. */
  const findSystemByKeyForUpdate = async (key: SystemKey) =>
    pool.maybeOne<Record<string, unknown>>(sql`
      select ${fields.value} from ${table}
      where ${fields.key} = ${key}
      for update
    `);

  /** Write the value of a system key, typed by the guard the key is registered with. */
  const upsertSystem = async <Key extends SystemKey>(key: Key, value: z.infer<SystemGuard[Key]>) =>
    pool.query(sql`
      insert into ${table} (${fields.key}, ${fields.value})
        values (${key}, ${sql.jsonb(value)})
        on conflict (${fields.key}) do update set ${fields.value} = excluded.${fields.value}
    `);

  return {
    findSystemByKey,
    findSystemByKeyForUpdate,
    upsertSystem,
  };
};
