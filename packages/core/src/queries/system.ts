import { type SystemKey, type SystemType, Systems } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(Systems);

/**
 * The value stored under each system key, e.g. `InstalledLicense` for `LicenseKey.License`. Built
 * from `SystemType`, which is a union of one-key maps, so a key can only be written with its own
 * value type.
 */
type SystemValueMap = {
  [Key in SystemKey]: Extract<SystemType, Record<Key, unknown>>[Key];
};

export const createSystemsQuery = (pool: CommonQueryMethods) => {
  const findSystemByKey = async (key: SystemKey) =>
    pool.maybeOne<Record<string, unknown>>(sql`
      select ${fields.value} from ${table}
      where ${fields.key} = ${key}
    `);

  const upsertSystem = async <Key extends SystemKey>(key: Key, value: SystemValueMap[Key]) =>
    pool.one<{ key: Key; value: SystemValueMap[Key] }>(sql`
      insert into ${table} (${fields.key}, ${fields.value})
        values (${key}, ${sql.jsonb(value)})
        on conflict (${fields.key}) do update set ${fields.value} = ${sql.jsonb(value)}
        returning ${fields.key}, ${fields.value}
    `);

  return {
    findSystemByKey,
    upsertSystem,
  };
};
