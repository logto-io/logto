import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      insert into organization_scopes (tenant_id, id, name, description)
        values ('admin', 'read-member', 'read:member', 'Read members of the tenant.');
      insert into organization_role_scope_relations (tenant_id, organization_role_id, organization_scope_id)
        values ('admin', 'admin', 'read-member'),
               ('admin', 'member', 'read-member');
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      delete from organization_role_scope_relations
        where tenant_id = 'admin' and organization_scope_id = 'read-member';
      delete from organization_scopes
        where tenant_id = 'admin' and id = 'read-member';
    `);
  },
};

export default alteration;
