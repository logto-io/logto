import { assert, type Nullable } from '@silverhand/essentials';
import {
  sql,
  type CommonQueryMethods,
  type DatabasePool,
  type DatabaseTransactionConnection,
} from '@silverhand/slonik';

/**
 * Switches the current transaction to the tenant's database role, the one core queries as, so
 * row-level security applies. The pool's user must be allowed to `set role` to that role.
 *
 * @throws If the tenant has no role, or the role bypasses row-level security.
 */
export const switchToTenantRole = async (connection: CommonQueryMethods, tenantId: string) => {
  const { dbUser } = await connection.one<{ dbUser: Nullable<string> }>(sql`
    select db_user as "dbUser" from tenants where id = ${tenantId}
  `);

  assert(dbUser, new Error(`Tenant ${tenantId} has no database role`));

  await connection.query(sql`set local role ${sql.identifier([dbUser])}`);
  assert(
    await connection.oneFirst<boolean>(sql`select row_security_active('tenants')`),
    new Error(`Role ${dbUser} bypasses row-level security`)
  );
};

/** Runs `step` in a transaction as the tenant's database role (see `switchToTenantRole`). */
export const runAsTenant = async <T>(
  pool: DatabasePool,
  tenantId: string,
  step: (transaction: DatabaseTransactionConnection) => Promise<T>
): Promise<T> =>
  pool.transaction(async (transaction) => {
    await switchToTenantRole(transaction, tenantId);

    return step(transaction);
  });
