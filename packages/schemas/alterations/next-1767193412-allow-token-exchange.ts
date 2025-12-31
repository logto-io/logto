import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    /**
     * Set allowTokenExchange = true for existing first-party MachineToMachine and Traditional applications
     * This matches the default behavior in buildCustomClientMetadata() for newly created apps
     */
    await pool.query(sql`
      update applications
        set custom_client_metadata = custom_client_metadata || '{"allowTokenExchange": true}'::jsonb
        where is_third_party = false
        and type in ('MachineToMachine', 'Traditional');
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
