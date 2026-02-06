import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const idTokenConfigKey = 'idToken';

const defaultIdTokenConfig = Object.freeze({
  enabledExtendedClaims: ['roles', 'organizations', 'organization_roles'],
});

const alteration: AlterationScript = {
  up: async (pool) => {
    const tenants = await pool.any<{ id: string }>(sql`select id from tenants`);

    for (const { id: tenantId } of tenants) {
      // eslint-disable-next-line no-await-in-loop
      await pool.query(sql`
        insert into logto_configs (tenant_id, key, value)
          values (${tenantId}, ${idTokenConfigKey}, ${sql.jsonb(defaultIdTokenConfig)})
      `);
    }
  },
  down: async (pool) => {
    await pool.query(sql`
      delete from logto_configs where key = ${idTokenConfigKey}
    `);
  },
};

export default alteration;
