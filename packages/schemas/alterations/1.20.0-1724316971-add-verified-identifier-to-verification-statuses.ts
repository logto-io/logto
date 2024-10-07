import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table verification_statuses add column verified_identifier varchar(255);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table verification_statuses drop column verified_identifier;
    `);
  },
};

export default alteration;
