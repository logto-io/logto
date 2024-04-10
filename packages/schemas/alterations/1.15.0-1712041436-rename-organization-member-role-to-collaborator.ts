import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      update organization_roles
        set id = 'collaborator', name = 'collaborator', description = 'Collaborator of the tenant, who has permissions to operate the tenant data, but not the tenant settings.'
        where tenant_id = 'admin' and id = 'member';
      update organization_role_scope_relations
        set organization_role_id = 'collaborator'
        where tenant_id = 'admin' and organization_role_id = 'member';
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      update organization_roles
        set id = 'member', name = 'member', description = 'Member of the tenant, who has permissions to operate the tenant data, but not the tenant settings.'
        where tenant_id = 'admin' and id = 'collaborator';
      update organization_role_scope_relations
        set organization_role_id = 'member'
        where tenant_id = 'admin' and organization_role_id = 'collaborator';
    `);
  },
};

export default alteration;
