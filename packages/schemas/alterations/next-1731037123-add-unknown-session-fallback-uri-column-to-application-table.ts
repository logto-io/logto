import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table applications
        add column unknown_session_fallback_uri text;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table applications
        drop column unknown_session_fallback_uri;
    `);
  },
};

export default alteration;
