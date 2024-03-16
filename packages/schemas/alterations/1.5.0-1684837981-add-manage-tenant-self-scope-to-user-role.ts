import { generateStandardId } from '@logto/shared/universal';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const adminTenantId = 'admin';

const alteration: AlterationScript = {
  up: async (pool) => {
    // Get `resourceId` of the admin tenant's resource whose indicator is `https://cloud.logto.io/api`.
    const { id: resourceId } = await pool.one<{ id: string }>(sql`
      select id from resources
      where tenant_id = ${adminTenantId}
      and indicator = 'https://cloud.logto.io/api'
    `);

    // Get `roleId` of the admin tenant's role whose name is `user`.
    const { id: roleId } = await pool.one<{ id: string }>(sql`
      select id from roles
      where tenant_id = ${adminTenantId}
      and name = 'user';
    `);

    // Insert `manage:tenant:self` scope.
    const scopeId = generateStandardId();
    await pool.query(sql`
      insert into scopes (tenant_id, id, name, description, resource_id)
        values (
          ${adminTenantId},
          ${scopeId},
          'manage:tenant:self',
          'Allow managing tenant itself, including update and delete.',
          ${resourceId}
        );
    `);
    // Assign `manage:tenant:self` scope to `user` role.
    await pool.query(sql`
      insert into roles_scopes (tenant_id, id, role_id, scope_id)
        values (
          ${adminTenantId},
          ${generateStandardId()},
          ${roleId},
          ${scopeId}
      );
    `);
  },
  down: async (pool) => {
    // Delete `manage:tenant:self` scope.
    // No need to delete `roles_scopes` because it will be cascade deleted.
    await pool.query(sql`
      delete from scopes
      where tenant_id = ${adminTenantId} and name = 'manage:tenant:self';
    `);
  },
};
export default alteration;
