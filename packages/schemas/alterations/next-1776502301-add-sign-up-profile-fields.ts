import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences
        add column sign_up_profile_fields jsonb;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences
        drop column sign_up_profile_fields;
    `);
  },
};

export default alteration;
