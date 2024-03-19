import type { AlterationState, System, SystemKey } from '@logto/schemas';
import { systemGuards, Systems, AlterationStateKey } from '@logto/schemas';
import type { Nullable } from '@silverhand/essentials';
import type { CommonQueryMethods, DatabaseTransactionConnection } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';
import { DatabaseError } from 'pg-protocol';
import type { z } from 'zod';

import { convertToIdentifiers } from '../sql.js';

const { fields, table } = convertToIdentifiers(Systems);

const doesTableExist = async (pool: CommonQueryMethods, table: string) => {
  const { rows } = await pool.query<{ regclass: Nullable<string> }>(
    sql`select to_regclass(${table}) as regclass`
  );

  return Boolean(rows[0]?.regclass);
};

export const doesSystemsTableExist = async (pool: CommonQueryMethods) =>
  doesTableExist(pool, Systems.table);

const legacyLogtoConfigsTable = '_logto_configs';

const getAlterationStateTable = async (pool: CommonQueryMethods) =>
  (await doesSystemsTableExist(pool))
    ? sql.identifier([Systems.table])
    : sql.identifier([legacyLogtoConfigsTable]); // Fall back to the old config table

export const getCurrentDatabaseAlterationTimestamp = async (pool: CommonQueryMethods) => {
  const table = await getAlterationStateTable(pool);

  try {
    const result = await pool.maybeOne<System>(
      sql`select * from ${table} where ${fields.key}=${AlterationStateKey.AlterationState}`
    );
    const parsed = systemGuards[AlterationStateKey.AlterationState].safeParse(result?.value);

    return (parsed.success && parsed.data.timestamp) || 0;
  } catch (error: unknown) {
    // Relation does not exist, treat as 0
    // https://www.postgresql.org/docs/14/errcodes-appendix.html
    if (error instanceof DatabaseError && error.code === '42P01') {
      return 0;
    }

    throw error;
  }
};

export const updateDatabaseTimestamp = async (
  connection: DatabaseTransactionConnection,
  timestamp: number
) => {
  const table = await getAlterationStateTable(connection);
  const value: AlterationState = {
    timestamp,
    updatedAt: new Date().toISOString(),
  };

  await connection.query(
    sql`
      insert into ${table} (${fields.key}, ${fields.value}) 
        values (${AlterationStateKey.AlterationState}, ${sql.jsonb(value)})
        on conflict (${fields.key}) do update set ${fields.value}=excluded.${fields.value}
    `
  );
};

export const getRowByKey = async (pool: CommonQueryMethods, key: SystemKey) =>
  pool.maybeOne<System>(sql`
    select ${sql.join([fields.key, fields.value], sql`,`)} from ${table}
      where ${fields.key} = ${key}
  `);

export const updateValueByKey = async <T extends SystemKey>(
  pool: CommonQueryMethods,
  key: T,
  value: z.infer<(typeof systemGuards)[T]>
) =>
  pool.query(
    sql`
      insert into ${table} (${fields.key}, ${fields.value}) 
        values (${key}, ${sql.jsonb(value)})
        on conflict (${fields.key})
          do update set ${fields.value}=excluded.${fields.value}
    `
  );
