import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const tables = [
  'applications_roles',
  'applications',
  'connectors',
  'custom_phrases',
  'logs',
  'logto_configs',
  'oidc_model_instances',
  'passcodes',
  'resources',
  'roles_scopes',
  'roles',
  'scopes',
  'sign_in_experiences',
  'users_roles',
  'users',
  'verification_statuses',
  'hooks',
];

const getDatabaseName = async (pool: CommonQueryMethods) => {
  const { currentDatabase } = await pool.one<{ currentDatabase: string }>(sql`
    select current_database();
  `);

  return currentDatabase.replaceAll('-', '_');
};

const alteration: AlterationScript = {
  up: async (pool) => {
    await Promise.all(
      tables.map(async (tableRaw) => {
        const table = sql.identifier([tableRaw]);
        const tenantIdPolicy = sql.identifier([`${tableRaw}_tenant_id`]);
        const modificationPolicy = sql.identifier([`${tableRaw}_modification`]);

        await pool.query(sql`
          drop policy ${tenantIdPolicy} on ${table};
          create policy ${tenantIdPolicy} on ${table}
            as restrictive
            using (tenant_id = (select id from tenants where db_user = current_user));
          create policy ${modificationPolicy} on ${table}
              using (true);
        `);
      })
    );
    await pool.query(sql`
      drop policy tenants_tenant_id on tenants;
      create policy tenants_tenant_id on tenants
        using (db_user = current_user);
    `);
  },
  down: async (pool) => {
    const role = sql.identifier([`logto_tenant_${await getDatabaseName(pool)}`]);

    await Promise.all(
      tables.map(async (tableRaw) => {
        const table = sql.identifier([tableRaw]);
        const tenantIdPolicy = sql.identifier([`${tableRaw}_tenant_id`]);
        const modificationPolicy = sql.identifier([`${tableRaw}_modification`]);

        await pool.query(sql`
          drop policy ${tenantIdPolicy} on ${table};
          drop policy ${modificationPolicy} on ${table};
          create policy ${tenantIdPolicy} on ${table}
            to ${role}
            using (tenant_id = (select id from tenants where db_user = current_user));
        `);
      })
    );
    await pool.query(sql`
      drop policy tenants_tenant_id on tenants;
      create policy tenants_tenant_id on tenants
        to ${role}
        using (db_user = current_user);
    `);
  },
};

export default alteration;
