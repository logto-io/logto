import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      DELETE FROM connectors WHERE enabled = false;
      ALTER TABLE connectors DROP COLUMN enabled;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      ALTER TABLE connectors ADD COLUMN enabled boolean NOT NULL DEFAULT false;
      UPDATE connectors SET enabled = true;
    `);
  },
};

export default alteration;
