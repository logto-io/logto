import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table saml_application_configs
        add column static_attributes jsonb not null default '{}'::jsonb;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table saml_application_configs drop column static_attributes;
    `);
  },
};

export default alteration;
