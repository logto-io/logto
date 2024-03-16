import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      drop index logs__user_id;
      drop index logs__application_id;

      create index logs__user_id
        on logs (tenant_id, (payload->>'userId'));
  
      create index logs__application_id
        on logs (tenant_id, (payload->>'applicationId'));
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop index logs__user_id;
      drop index logs__application_id;

      create index logs__user_id
        on logs (tenant_id, (payload->>'user_id') nulls last);

      create index logs__application_id
        on logs (tenant_id, (payload->>'application_id') nulls last);
    `);
  },
};

export default alteration;
