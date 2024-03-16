import type { LogtoConfig, LogtoConfigKey, logtoConfigGuards } from '@logto/schemas';
import { LogtoConfigs } from '@logto/schemas';
import type { Nullable } from '@silverhand/essentials';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';
import type { z } from 'zod';

import { convertToIdentifiers } from '../sql.js';

const { table, fields } = convertToIdentifiers(LogtoConfigs);

export const doesConfigsTableExist = async (pool: CommonQueryMethods) => {
  const { rows } = await pool.query<{ regclass: Nullable<string> }>(
    sql`select to_regclass(${LogtoConfigs.table}) as regclass`
  );

  return Boolean(rows[0]?.regclass);
};

export const getRowsByKeys = async (
  pool: CommonQueryMethods,
  tenantId: string,
  keys: LogtoConfigKey[]
) =>
  pool.query<LogtoConfig>(sql`
    select ${sql.join([fields.key, fields.value], sql`,`)} from ${table}
      where ${fields.tenantId} = ${tenantId}
      and ${fields.key} in (${sql.join(keys, sql`,`)})
  `);

export const updateValueByKey = async <T extends LogtoConfigKey>(
  pool: CommonQueryMethods,
  tenantId: string,
  key: T,
  value: z.infer<(typeof logtoConfigGuards)[T]>
) =>
  pool.query(
    sql`
      insert into ${table} (${fields.tenantId}, ${fields.key}, ${fields.value}) 
        values (${tenantId}, ${key}, ${sql.jsonb(value)})
        on conflict (${fields.tenantId}, ${fields.key})
          do update set ${fields.value}=excluded.${fields.value}
    `
  );
