import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const getDatabaseName = async (pool: CommonQueryMethods) => {
  const { currentDatabase } = await pool.one<{ currentDatabase: string }>(sql`
    select current_database();
  `);

  return currentDatabase.replaceAll('-', '_');
};

/**
 * Grant read permission to the is_suspended column in the tenants table to the logto_tenant_<databaseName> role.
 */
const alteration: AlterationScript = {
  up: async (pool) => {
    const databaseName = await getDatabaseName(pool);
    const baseRoleId = sql.identifier([`logto_tenant_${databaseName}`]);

    await pool.query(sql`
      grant select (is_suspended)
        on table tenants
        to ${baseRoleId}
    `);
  },
  down: async (pool) => {
    const databaseName = await getDatabaseName(pool);
    const baseRoleId = sql.identifier([`logto_tenant_${databaseName}`]);

    await pool.query(sql`
      revoke select(is_suspended)
        on table tenants
        from ${baseRoleId}
    `);
  },
};

export default alteration;
