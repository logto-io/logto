import { Tenants } from '@logto/schemas/models';
import { isKeyInObject } from '@logto/shared';
import { conditionalString } from '@silverhand/essentials';
import { identifier, sql } from '@withtyped/postgres';
import type { QueryClient } from '@withtyped/server';
import { parseDsn, stringifyDsn } from 'slonik';

import type { EnvSet } from '#src/env-set/index.js';

/**
 * This function is to fetch the tenant password for the corresponding Postgres user.
 *
 * In multi-tenancy mode, Logto should ALWAYS use a restricted user with RLS enforced to ensure data isolation between tenants.
 */
export const getTenantDatabaseDsn = async (defaultEnvSet: EnvSet, tenantId: string) => {
  const {
    tableName,
    rawKeys: { id, dbUserPassword },
  } = Tenants;

  const { rows } = await defaultEnvSet.queryClient.query(sql`
    select ${identifier(dbUserPassword)}
    from ${identifier(tableName)}
    where ${identifier(id)} = ${tenantId}
  `);
  const password = rows[0]?.db_user_password;

  if (!password || typeof password !== 'string') {
    throw new Error(`Cannot find valid tenant credentials for ID ${tenantId}`);
  }

  const options = parseDsn(defaultEnvSet.databaseUrl);

  return stringifyDsn({ ...options, username: `tenant_${tenantId}`, password });
};

export const checkRowLevelSecurity = async (client: QueryClient) => {
  const { rows } = await client.query(sql`
    select tablename
    from pg_catalog.pg_tables
    where schemaname = current_schema()
    and rowsecurity=false
  `);

  if (rows.length > 0) {
    throw new Error(
      'Row-level security has to be enforced on EVERY table when starting Logto in multi-tenancy mode.\n' +
        `Found following table(s) without RLS: ${rows
          .map((row) => conditionalString(isKeyInObject(row, 'tablename') && String(row.tablename)))
          .join(', ')}\n\n` +
        'Did you forget to run `npm cli db multi-tenancy enable`?'
    );
  }
};
