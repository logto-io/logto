import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      delete from organization_role_scope_relations
        where tenant_id = 'admin' and organization_role_id = 'member' and organization_scope_id = 'invite-member';
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      insert into organization_role_scope_relations (tenant_id, organization_role_id, organization_scope_id)
        values ('admin', 'member', 'invite-member');
    `);
  },
};

export default alteration;
