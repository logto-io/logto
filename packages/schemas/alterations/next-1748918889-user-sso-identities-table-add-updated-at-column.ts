import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table user_sso_identities
        add column updated_at timestamp;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table user_sso_identities
        drop column updated_at;
    `);
  },
};

export default alteration;
