import type { LogtoConfig, LogtoConfigKey, logtoConfigGuards } from '@logto/schemas';
import { LogtoConfigs } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import type { Nullable } from '@silverhand/essentials';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';
import type { z } from 'zod';

const { table, fields } = convertToIdentifiers(LogtoConfigs);

export const doesConfigsTableExist = async (pool: CommonQueryMethods) => {
  const { rows } = await pool.query<{ regclass: Nullable<string> }>(
    sql`select to_regclass(${LogtoConfigs.table}) as regclass`
  );

  return Boolean(rows[0]?.regclass);
};

export const getRowsByKeys = async (pool: CommonQueryMethods, keys: LogtoConfigKey[]) =>
  pool.query<LogtoConfig>(sql`
    select ${sql.join([fields.key, fields.value], sql`,`)} from ${table}
      where ${fields.key} in (${sql.join(keys, sql`,`)})
  `);

export const updateValueByKey = async <T extends LogtoConfigKey>(
  pool: CommonQueryMethods,
  key: T,
  value: z.infer<typeof logtoConfigGuards[T]>
) =>
  pool.query(
    sql`
      insert into ${table} (${fields.key}, ${fields.value}) 
        values (${key}, ${sql.jsonb(value)})
        on conflict (${fields.key}) do update set ${fields.value}=excluded.${fields.value}
    `
  );
