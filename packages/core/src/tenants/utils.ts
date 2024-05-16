import { Tenants } from '@logto/schemas/models';
import { conditional } from '@silverhand/essentials';
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
