import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    // Make the resource scopes description nullable
    await pool.query(sql`
      alter table scopes
      alter column description drop not null;
    `);
  },
  down: async (pool) => {
    // Revert the resource scopes description nullable
    await pool.query(sql`
      alter table scopes
      alter column description set not null;
    `);
  },
};

export default alteration;
