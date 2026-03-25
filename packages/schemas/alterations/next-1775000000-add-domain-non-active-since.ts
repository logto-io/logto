import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table domains
        add column non_active_since timestamptz
    `);

    await pool.query(sql`
      update domains
      set non_active_since = case
        when status = 'Active' then null
        else updated_at
      end
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table domains
        drop column non_active_since
    `);
  },
};

export default alteration;
