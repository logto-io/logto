import { LogtoConfig, logtoConfigGuards, LogtoConfigKey, LogtoConfigs } from '@logto/schemas';
import { DatabasePool, sql } from 'slonik';
import { z } from 'zod';

import { convertToIdentifiers } from '../database';

const { table, fields } = convertToIdentifiers(LogtoConfigs);

export const getRowsByKeys = async (pool: DatabasePool, keys: LogtoConfigKey[]) =>
  pool.query<LogtoConfig>(sql`
    select ${sql.join([fields.key, fields.value], sql`,`)} from ${table}
      where ${fields.key} in (${sql.join(keys, sql`,`)})
  `);

export const updateValueByKey = async <T extends LogtoConfigKey>(
  pool: DatabasePool,
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
