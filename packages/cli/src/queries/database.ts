import { adminTenantId, defaultTenantId } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

export const getDatabaseName = async (pool: CommonQueryMethods, normalized = false) => {
  const { currentDatabase } = await pool.one<{ currentDatabase: string }>(sql`
    select current_database();
  `);

  return normalized ? currentDatabase.replaceAll('-', '_') : currentDatabase;
};

/**
 * Check the roles that a fresh Logto database needs before creating any tables.
 *
 * PostgreSQL roles are shared by the whole cluster, so dropping a database does not remove the
 * roles that were created for it. Reusing an existing role could change the permissions of another
 * Logto installation, therefore the seed command must stop and let an administrator inspect the
 * roles instead.
 */
export const assertNoExistingTenantRoles = async (pool: CommonQueryMethods, database: string) => {
  const roleNames = [
    `logto_tenant_${database}`,
    `logto_tenant_${database}_${defaultTenantId}`,
    `logto_tenant_${database}_${adminTenantId}`,
  ];

  const existingRoles = await pool.any<{ roleName: string }>(sql`
    select rolname as "roleName"
    from pg_roles
    where rolname in (${sql.join(
      roleNames.map((roleName) => sql`${roleName}`),
      sql`, `
    )})
    order by rolname
  `);

  if (existingRoles.length > 0) {
    throw new Error(
      [
        `Cannot seed database "${database}" because these PostgreSQL roles already exist:`,
        ...existingRoles.map(({ roleName }) => `  - ${roleName}`),
        '',
        'PostgreSQL roles are cluster-wide and are not removed when a database is dropped.',
        'Verify that the roles belong to an old Logto installation, remove them as a PostgreSQL administrator, and run the seed command again.',
      ].join('\n')
    );
  }
};
