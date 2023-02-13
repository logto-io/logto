import { generateStandardId } from '@logto/core-kit';
import type { TenantModel } from '@logto/schemas';
import type { DatabaseTransactionConnection } from 'slonik';
import { sql } from 'slonik';
import { raw } from 'slonik-sql-tag-raw';

import { insertInto } from '../../../database.js';
import { getDatabaseName } from '../../../queries/database.js';

export const createTenant = async (connection: DatabaseTransactionConnection, tenantId: string) => {
  const database = await getDatabaseName(connection, true);
  const parentRole = `logto_tenant_${database}`;
  const role = `logto_tenant_${database}_${tenantId}`;
  const password = generateStandardId(32);
  const tenantModel: TenantModel = { id: tenantId, dbUser: role, dbUserPassword: password };

  await connection.query(insertInto(tenantModel, 'tenants'));
  await connection.query(sql`
    create role ${sql.identifier([role])} with inherit login
      password '${raw(password)}'
      in role ${sql.identifier([parentRole])};
  `);
};
