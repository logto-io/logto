import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  // `create index concurrently` cannot run in a transaction; the runner wraps up/down in one.
  beforeUp: async (pool) => {
    await pool.query(sql`
      create index concurrently users__tenant_lower_username
        on users (tenant_id, lower(username))
        where username is not null;
    `);
  },
  up: async (pool) => {
    // The default must be inlined: DDL cannot use bound parameters.
    await pool.query(sql`
      alter table sign_in_experiences
        add column username_policy jsonb not null default '{
          "caseSensitive": true,
          "minLength": 1,
          "maxLength": 128,
          "allowedChars": {
            "lowercase": true,
            "uppercase": true,
            "numbers": true,
            "underscore": true
          }
        }'::jsonb;
    `);
  },
  beforeDown: async (pool) => {
    await pool.query(sql`drop index concurrently users__tenant_lower_username;`);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences drop column username_policy;
    `);
  },
};

export default alteration;
