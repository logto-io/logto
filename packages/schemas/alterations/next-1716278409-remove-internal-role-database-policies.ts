import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      drop policy if exists roles_select on roles;
      drop policy if exists roles_modification on roles;
      create policy roles_modification on roles using (true);
      
      drop policy if exists roles_scopes_select on roles_scopes;
      drop policy if exists roles_scopes_modification on roles_scopes;
      create policy roles_scopes_modification on roles_scopes using (true);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      create policy roles_select on roles
        for select using (true);

      drop policy roles_modification on roles;
      create policy roles_modification on roles
        using (not starts_with(name, '#internal:'));

      -- Restrict role - scope modification
      create policy roles_scopes_select on roles_scopes
        for select using (true);

      drop policy roles_scopes_modification on roles_scopes;
      create policy roles_scopes_modification on roles_scopes
        using (not starts_with((select roles.name from roles where roles.id = role_id), '#internal:'));
    `);
  },
};

export default alteration;
