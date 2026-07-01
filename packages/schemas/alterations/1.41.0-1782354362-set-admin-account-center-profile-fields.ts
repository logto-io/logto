import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const adminTenantId = 'admin';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      update account_centers
      set profile_fields = '[{"name": "name"}, {"name": "avatar"}]'::jsonb
      where tenant_id = ${adminTenantId}
        and id = 'default'
        and profile_fields is null
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      update account_centers
      set profile_fields = null
      where tenant_id = ${adminTenantId}
        and id = 'default'
        and profile_fields = '[{"name": "name"}, {"name": "avatar"}]'::jsonb
    `);
  },
};

export default alteration;
