import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    /**
     * For backward compatibility, set allowTokenExchange = true for existing first-party
     * Traditional, Native, and SPA applications.
     * M2M applications were never allowed to use token exchange before this feature.
     * The admin-console is excluded as a built-in application.
     * Note: demo-app and account-center are virtual built-in apps that don't exist in the database.
     */
    await pool.query(sql`
      update applications
        set custom_client_metadata = custom_client_metadata || '{"allowTokenExchange": true}'::jsonb
        where is_third_party = false
        and type in ('Traditional', 'Native', 'SPA')
        and id != 'admin-console';
    `);
  },
  down: async (pool) => {
    // Remove allowTokenExchange from all applications
    await pool.query(sql`
      update applications
        set custom_client_metadata = custom_client_metadata - 'allowTokenExchange';
    `);
  },
};

export default alteration;
