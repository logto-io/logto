import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    // Add new tenant columns for name, tag, and created_at.
    await pool.query(sql`
      alter table tenants add column name varchar(128) not null default 'My Project';
      alter table tenants add column tag varchar(64) not null default 'development';
      alter table tenants add column created_at timestamptz not null default(now());
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table tenants drop column name;
      alter table tenants drop column tag;
      alter table tenants drop column created_at;
    `);
  },
};
export default alteration;
