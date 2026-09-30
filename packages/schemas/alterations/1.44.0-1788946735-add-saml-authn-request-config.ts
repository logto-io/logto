import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table saml_application_configs add column authn_request_config jsonb;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table saml_application_configs drop column authn_request_config;
    `);
  },
};

export default alteration;
