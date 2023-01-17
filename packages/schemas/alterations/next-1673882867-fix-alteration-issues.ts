import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table roles_scopes
      drop constraint roles_scopes_role_id_fkey;
    `);
    await pool.query(sql`
      alter table users_roles
      drop constraint users_roles_role_id_fkey;
    `);
    await pool.query(sql`drop index roles_pkey;`);
    await pool.query(sql`
      alter table roles
      add primary key (id);
    `);

    await pool.query(sql`
      alter table roles_scopes
      drop constraint roles_permissison_pkey,
      add primary key (role_id, scope_id);
    `);

    await pool.query(sql`
      alter table users_roles
      add foreign key (role_id) references roles (id) on update cascade on delete cascade;
    `);
    await pool.query(sql`
      alter table roles_scopes
      add foreign key (role_id) references roles (id) on update cascade on delete cascade;
    `);
  },
  down: async (pool) => {
    throw new Error('Not implemented');
  },
};

export default alteration;
