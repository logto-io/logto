import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

enum RoleType {
  User = 'User',
}

const getManagementApiResourceIndicator = (tenantId: string) => `https://${tenantId}.logto.app/api`;

// Remove management API scopes assigned to user roles, in case they were assigned by management API and bypassed the constraints in admin console.
const alteration: AlterationScript = {
  up: async (pool) => {
    const { rows } = await pool.query<{
      rolesScopesId: string;
      indicator: string;
      tenantId: string;
    }>(sql`
      select
        roles_scopes.id as "rolesScopesId",
        roles_scopes.tenant_id as "tenantId",
        resources.indicator as indicator from roles_scopes
      join roles
        on roles_scopes.role_id = roles.id and roles_scopes.tenant_id = roles.tenant_id
      join scopes on
        roles_scopes.scope_id = scopes.id and roles_scopes.tenant_id = scopes.tenant_id
      join resources on
        scopes.resource_id = resources.id and scopes.tenant_id = resources.tenant_id
      where roles.type = ${RoleType.User};
    `);
    const rolesScopesIdsToRemove = rows
      .filter(
        ({ indicator, tenantId }) => indicator === getManagementApiResourceIndicator(tenantId)
      )
      .map(({ rolesScopesId }) => rolesScopesId);
    if (rolesScopesIdsToRemove.length > 0) {
      await pool.query(sql`
        delete from roles_scopes where id in (${sql.join(rolesScopesIdsToRemove, sql`, `)});
      `);
    }
  },
  down: async (pool) => {
    // It cannot be reverted automatically.
  },
};

export default alteration;
