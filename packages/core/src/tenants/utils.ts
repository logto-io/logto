import { Systems } from '@logto/schemas';
import { Tenants } from '@logto/schemas/models';
import { isKeyInObject } from '@logto/shared';
import { conditional, conditionalString } from '@silverhand/essentials';
import { identifier, sql } from '@withtyped/postgres';
import type { QueryClient } from '@withtyped/server';
import { parseDsn, stringifyDsn } from 'slonik';

import { EnvSet } from '#src/env-set/index.js';

/**
 * This function is to fetch the tenant password for the corresponding Postgres user.
 *
 * In multi-tenancy mode, Logto should ALWAYS use a restricted user with RLS enforced to ensure data isolation between tenants.
 */
export const getTenantDatabaseDsn = async (tenantId: string) => {
  const { queryClient, dbUrl } = EnvSet;
  const {
    tableName,
    rawKeys: { id, dbUser, dbUserPassword },
  } = Tenants;

  const { rows } = await queryClient.query(sql`
    select ${identifier(dbUser)}, ${identifier(dbUserPassword)}
    from ${identifier(tableName)}
    where ${identifier(id)} = ${tenantId}
  `);

  if (!rows[0]) {
    throw new Error(`Cannot find valid tenant credentials for ID ${tenantId}`);
  }

  const options = parseDsn(dbUrl);
  const username = rows[0][dbUser];
  const password = rows[0][dbUserPassword];

  return stringifyDsn({
    ...options,
    username: conditional(typeof username === 'string' && username),
    password: conditional(typeof password === 'string' && password),
  });
};

export const checkRowLevelSecurity = async (client: QueryClient) => {
  const { rows } = await client.query(sql`
    select tablename
    from pg_catalog.pg_tables
    where schemaname = current_schema()
    and rowsecurity=false
  `);

  const rlsDisabled = rows.filter(({ tablename }) => tablename !== Systems.table);

  if (rlsDisabled.length > 0) {
    throw new Error(
      'Row-level security has to be enforced on EVERY business table when starting Logto.\n' +
        `Found following table(s) without RLS: ${rlsDisabled
          .map((row) => conditionalString(isKeyInObject(row, 'tablename') && String(row.tablename)))
          .join(', ')}\n\n` +
        'Did you forget to run `npm cli db alteration deploy`?'
    );
  }
};
