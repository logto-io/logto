import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const adminConsoleConfigKey = 'adminConsole';

const alteration: AlterationScript = {
  up: async (pool) => {
    const tenantIds = await pool.many<{ id: string }>(sql`select id from tenants`);

    await Promise.all(
      tenantIds.map(async ({ id }) => {
        const { count } = await pool.one<{ count: number }>(sql`
          select count(*) from connectors
            where tenant_id = ${id} and connector_id <> 'logto-sms' and connector_id <> 'logto-email' and connector_id <> 'logto-social-demo';
        `);

        if (count > 0) {
          await pool.query(sql`
            update logto_configs set value = jsonb_set(value, '{passwordlessConfigured}', 'true')
              where tenant_id = ${id} and key = ${adminConsoleConfigKey};
          `);
        }
      })
    );
  },
  down: async () => {
    // Do nothing as there is no alteration made to the DB schemas, only fixing data.
  },
};

export default alteration;
