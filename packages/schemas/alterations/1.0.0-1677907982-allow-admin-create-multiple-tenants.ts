import { generateStandardId } from '@logto/shared/universal';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const adminTenantId = 'admin';

const alteration: AlterationScript = {
  up: async (pool) => {
    const scopeId = generateStandardId();
    const { id: resourceId } = await pool.one<{ id: string }>(sql`
      select id from resources
      where tenant_id = ${adminTenantId}
      and indicator = 'https://cloud.logto.io/api'
    `);

    await pool.query(sql`
      insert into scopes (tenant_id, id, name, description, resource_id)
        values (
          ${adminTenantId},
          ${scopeId},
          'manage:tenant',
          'Allow managing existing tenants, including create without limitation, update, and delete.',
          ${resourceId}
        );
    `);

    const { id: roleId } = await pool.one<{ id: string }>(sql`
      select id from roles
      where tenant_id = ${adminTenantId}
      and name = 'admin:admin'
    `);

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
    await pool.query(sql`
      delete from scopes
        using resources
        where resources.id = scopes.resource_id
        and scopes.tenant_id = ${adminTenantId}
        and resources.indicator = 'https://cloud.logto.io/api'
        and scopes.name='manage:tenant';
    `);
  },
};

export default alteration;
