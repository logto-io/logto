import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table service_logs drop constraint service_logs_tenant_id_fkey;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table service_logs add constraint service_logs_tenant_id_fkey 
        foreign key (tenant_id) references tenants(id) on update cascade on delete cascade;
    `);
  },
};

export default alteration;
