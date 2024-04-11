import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table roles_scopes alter column role_id set not null;
      alter table roles_scopes alter column scope_id set not null;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table roles_scopes
        drop constraint if exists roles_permissison_pkey,
        drop constraint if exists roles_scopes_pkey;
      alter table roles_scopes alter column role_id drop not null;
      alter table roles_scopes alter column scope_id drop not null;
      alter table roles_scopes add primary key (role_id, scope_id)
    `);
  },
};

export default alteration;
