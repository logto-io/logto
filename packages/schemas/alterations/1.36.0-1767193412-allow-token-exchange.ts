import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    /**
     * For backward compatibility, set allowTokenExchange = true for existing first-party
     * Traditional, Native, and SPA applications.
     * M2M applications were never allowed to use token exchange before this feature.
     *
     * The admin-console should keep token exchange disabled, so we skip it here.
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
    // Remove allowTokenExchange only from applications that were updated in the `up` migration
    await pool.query(sql`
      update applications
        set custom_client_metadata = custom_client_metadata - 'allowTokenExchange'
        where is_third_party = false
        and type in ('Traditional', 'Native', 'SPA')
        and id != 'admin-console';
    `);
  },
};

export default alteration;
