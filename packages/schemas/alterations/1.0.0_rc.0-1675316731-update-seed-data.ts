import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      update roles
        set id = 'admin-role'
        where id = 'ac-admin-id';
      update scopes
        set 
          id = 'management-api-all',
          name = 'all',
          description = 'Default scope for Management API, allows all permissions.'
        where id = 'management-api-scope';
      -- this update is one-way since no need to revert the id column as it's just for seeding not querying
      update roles_scopes
        set id = 'admin-role-scope'
        where role_id = 'admin-role'
        and scope_id = 'management-api-all';
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      update roles
        set id = 'ac-admin-id'
        where id = 'admin-role';
      update scopes
        set 
          id = 'management-api-scope',
          name = 'management-api:default',
          description = 'Default scope for Management API.'
        where id = 'management-api-all';
    `);
  },
};

export default alteration;
