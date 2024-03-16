import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table sso_connectors
        add constraint sso_connectors__connector_name__unique 
          unique (tenant_id, connector_name);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sso_connectors
        drop constraint sso_connectors__connector_name__unique;
    `);
  },
};

export default alteration;
