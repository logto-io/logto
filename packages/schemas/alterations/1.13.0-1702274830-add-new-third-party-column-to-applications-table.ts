import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table applications add is_third_party boolean not null default false;
      create index applications__is_third_party on applications (tenant_id, is_third_party);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop index applications__is_third_party;
      alter table applications drop is_third_party;
    `);
  },
};

export default alteration;
