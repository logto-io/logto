import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`alter table organizations add column custom_css text;`);
  },
  down: async (pool) => {
    await pool.query(sql`alter table organizations drop column custom_css;`);
  },
};

export default alteration;
