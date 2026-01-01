import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const adminTenantId = 'admin';

/**
 * Enable the account center for the admin tenant and set all fields to Edit.
 * This allows the console profile page to use the Account API.
 */
const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      update account_centers
      set enabled = true,
          fields = '{"name": "Edit", "avatar": "Edit", "profile": "Edit", "email": "Edit", "phone": "Edit", "password": "Edit", "username": "Edit", "social": "Edit", "customData": "Edit", "mfa": "Edit"}'::jsonb
      where tenant_id = ${adminTenantId}
        and id = 'default'
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      update account_centers
      set enabled = false,
          fields = '{}'::jsonb
      where tenant_id = ${adminTenantId}
        and id = 'default'
    `);
  },
};

export default alteration;
