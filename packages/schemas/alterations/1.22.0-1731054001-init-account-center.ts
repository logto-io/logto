import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    // Process in chunks of 1000 tenants
    const batchSize = 1000;
    // eslint-disable-next-line @silverhand/fp/no-let
    let offset = 0;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const tenants = await pool.any<{ id: string }>(sql`
        select id from tenants
        order by created_at asc, id asc
        limit ${batchSize} offset ${offset};
      `);

      if (tenants.length === 0) {
        break;
      }

      const values = tenants.map((tenant) => sql`(${tenant.id}, 'default')`);
      // eslint-disable-next-line no-await-in-loop
      await pool.query(sql`
        insert into account_centers (tenant_id, id)
        values ${sql.join(values, sql`, `)}
      `);

      // eslint-disable-next-line @silverhand/fp/no-mutation
      offset += batchSize;
    }
  },
  down: async (pool) => {
    await pool.query(sql`
      delete from account_centers where id = 'default';
    `);
  },
};

export default alteration;
