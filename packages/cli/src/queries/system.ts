import type { AlterationState, System } from '@logto/schemas';
import { systemGuards, Systems, AlterationStateKey } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import type { Nullable } from '@silverhand/essentials';
import type { CommonQueryMethods, DatabaseTransactionConnection } from 'slonik';
import { sql } from 'slonik';
import { z } from 'zod';

const { fields } = convertToIdentifiers(Systems);

const doesTableExist = async (pool: CommonQueryMethods, table: string) => {
  const { rows } = await pool.query<{ regclass: Nullable<string> }>(
    sql`select to_regclass(${table}) as regclass`
  );

  return Boolean(rows[0]?.regclass);
};

export const doesSystemsTableExist = async (pool: CommonQueryMethods) =>
  doesTableExist(pool, Systems.table);

const getAlterationStateTable = async (pool: CommonQueryMethods) =>
  (await doesSystemsTableExist(pool))
    ? sql.identifier([Systems.table])
    : sql.identifier(['_logto_configs']); // Fall back to the old config table

export const getCurrentDatabaseAlterationTimestamp = async (pool: CommonQueryMethods) => {
  const table = await getAlterationStateTable(pool);

  try {
    const result = await pool.maybeOne<System>(
      sql`select * from ${table} where ${fields.key}=${AlterationStateKey.AlterationState}`
    );
    const parsed = systemGuards[AlterationStateKey.AlterationState].safeParse(result?.value);

    return (parsed.success && parsed.data.timestamp) || 0;
  } catch (error: unknown) {
    const result = z.object({ code: z.string() }).safeParse(error);

    // Relation does not exist, treat as 0
    // https://www.postgresql.org/docs/14/errcodes-appendix.html
    if (result.success && result.data.code === '42P01') {
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
