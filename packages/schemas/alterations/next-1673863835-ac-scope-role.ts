import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const managementResourceScopeId = 'management-api-scope';
const adminConsoleAdminRoleId = 'ac-admin-id';

const alteration: AlterationScript = {
  up: async (pool) => {
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
