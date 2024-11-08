import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    const tenants = await pool.many<{ id: string }>(sql`
      select id from tenants;
    `);
    const values = tenants.map((tenant) => sql`(${tenant.id}, 'default')`);

    // Other fileds have default values so we don't need to set them here
    await pool.query(sql`
      insert into account_centers (tenant_id, id)
      values ${sql.join(values, sql`, `)};
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      delete from account_centers where id = 'default';
    `);
  },
};

export default alteration;
