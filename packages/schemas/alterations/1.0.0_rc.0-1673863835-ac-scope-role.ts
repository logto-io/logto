import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const adminConsoleAdminRoleId = 'ac-admin-id';
const adminRoleName = 'admin';
const managementResourceScopeId = 'management-api-scope';

const alteration: AlterationScript = {
  up: async (pool) => {
    // Fix role id
    const newRole = await pool.maybeOne(sql`
      select * from roles
       where id = ${adminConsoleAdminRoleId}
    `);

    if (!newRole) {
      await pool.query(sql`
        update roles
          set id = ${adminConsoleAdminRoleId}
          where name = ${adminRoleName}
      `);
    }

    // Fix scope role
    const relation = await pool.maybeOne(sql`
      select * from roles_scopes
        where scope_id = ${managementResourceScopeId}
        and role_id = ${adminConsoleAdminRoleId}
    `);

    if (!relation) {
      await pool.query(sql`
        insert into roles_scopes
          (role_id, scope_id)
          values (${adminConsoleAdminRoleId}, ${managementResourceScopeId})
      `);
    }
  },
  down: async () => {
    // This is a hotfix for seed, down script is not needed
  },
};

export default alteration;
