import { ServiceLogs, Systems } from '@logto/schemas';
import { Tenants } from '@logto/schemas/models';
import { isKeyInObject } from '@logto/shared';
import { conditional, conditionalString } from '@silverhand/essentials';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { parseDsn, sql, stringifyDsn } from '@silverhand/slonik';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';

export class TenantNotFoundError extends Error {}

/**
 * This function is to fetch the tenant password for the corresponding Postgres user.
 *
 * ** **CAUTION** ** In multi-tenancy mode, Logto should ALWAYS use a restricted user with RLS enforced to ensure data isolation between tenants.
 */
export const getTenantDatabaseDsn = async (tenantId: string) => {
  const { sharedPool, dbUrl } = EnvSet;
  const {
    tableName,
    rawKeys: { id, dbUser, dbUserPassword },
  } = Tenants;

  const identifier = (id: string) => sql.identifier([id]);
  const pool = await sharedPool;

  const { rows } = await pool.query(sql`
    select ${identifier(dbUser)}, ${identifier(dbUserPassword)}
    from ${identifier(tableName)}
    where ${identifier(id)} = ${tenantId}
  `);

  if (!rows[0]) {
    throw new TenantNotFoundError(`Cannot find valid tenant credentials for ID ${tenantId}`);
  }

  const options = parseDsn(dbUrl);
  const { dbUser: username, dbUserPassword: password } = z
    .object({ dbUser: z.string(), dbUserPassword: z.string().optional() })
    .parse(rows[0]);

  return stringifyDsn({
    ...options,
    username,
    password: conditional(typeof password === 'string' && password),
  });
};

export const checkRowLevelSecurity = async (client: CommonQueryMethods) => {
  const { rows } = await client.query(sql`
    select tablename
    from pg_catalog.pg_tables
    where schemaname = current_schema()
    and rowsecurity=false
  `);

  const rlsDisabled = rows.filter(
    ({ tablename }) => tablename !== Systems.table && tablename !== ServiceLogs.table
  );

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
