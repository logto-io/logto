import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    // Cloud region databases other than the admin tenant's own have no `admin` tenant to hold the role.
    const adminTenant = await pool.maybeOne(sql`
      select id from tenants where id = 'admin'
    `);

    if (!adminTenant) {
      return;
    }

    await pool.query(sql`
      update organization_scopes
        set description = 'Write the tenant data.'
        where tenant_id = 'admin' and id = 'write-data';
      insert into organization_roles (tenant_id, id, name, description, type)
        values ('admin', 'viewer', 'viewer', 'Viewer of the tenant, who can read the tenant data and members but cannot change anything.', 'User');
      insert into organization_role_scope_relations (tenant_id, organization_role_id, organization_scope_id)
        values ('admin', 'viewer', 'read-data'),
               ('admin', 'viewer', 'read-member');
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      delete from organization_roles
        where tenant_id = 'admin' and id = 'viewer';
      update organization_scopes
        set description = 'Write the tenant data, including creating and updating the tenant.'
        where tenant_id = 'admin' and id = 'write-data';
    `);
  },
};

export default alteration;
