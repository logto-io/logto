import { generateStandardId } from '@logto/shared/universal';
import { sql } from 'slonik';

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

    await pool.query(sql`
      insert into scopes (tenant_id, id, name, description, resource_id)
        values (
          ${adminTenantId},
          ${generateStandardId()},
          'create:affiliate',
          'Allow creating new affiliates and logs.',
          ${resourceId}
        ), (
          ${adminTenantId},
          ${generateStandardId()},
          'manage:affiliate',
          'Allow managing affiliates, including create, update, and delete.',
          ${resourceId}
        );
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      delete from scopes
      where tenant_id = ${adminTenantId} and name = any('create:affiliate', 'manage:affiliate');
    `);
  },
};

export default alteration;
