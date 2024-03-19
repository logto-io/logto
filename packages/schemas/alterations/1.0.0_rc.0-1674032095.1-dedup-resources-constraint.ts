import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

/** Drop `resources_indicator_key` unique constraint since it's duplicated with the unique index. */
const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table resources
        drop constraint resources_indicator_key;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table resources
        add constraint resources_indicator_key unique (indicator);
    `);
  },
};

export default alteration;
