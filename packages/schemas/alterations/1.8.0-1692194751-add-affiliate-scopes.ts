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

    const { id: roleId } = await pool.one<{ id: string }>(sql`
      select id from roles
      where tenant_id = ${adminTenantId}
      and name = 'admin:admin'
    `);

    const createAffiliateId = generateStandardId();
    const manageAffiliateId = generateStandardId();

    await pool.query(sql`
      insert into scopes (tenant_id, id, name, description, resource_id)
        values (
          ${adminTenantId},
          ${createAffiliateId},
          'create:affiliate',
          'Allow creating new affiliates and logs.',
          ${resourceId}
        ), (
          ${adminTenantId},
          ${manageAffiliateId},
          'manage:affiliate',
          'Allow managing affiliates, including create, update, and delete.',
          ${resourceId}
        );
    `);

    await pool.query(sql`
      insert into roles_scopes (tenant_id, id, role_id, scope_id) values
        (${adminTenantId}, ${generateStandardId()}, ${roleId}, ${createAffiliateId}),
        (${adminTenantId}, ${generateStandardId()}, ${roleId}, ${manageAffiliateId});
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      delete from scopes
      where tenant_id = ${adminTenantId} and name = any(array['create:affiliate', 'manage:affiliate']);
    `);
  },
};

export default alteration;
