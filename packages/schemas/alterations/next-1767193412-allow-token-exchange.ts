import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    // Only set allowTokenExchange = true for first-party M2M and Traditional applications
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
