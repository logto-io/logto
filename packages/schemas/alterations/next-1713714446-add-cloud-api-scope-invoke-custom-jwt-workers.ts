import { generateStandardId } from '@logto/shared/universal';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

type Resource = {
  tenantId: string;
  id: string;
  name: string;
  indicator: string;
};

const cloudApiIndicator = 'https://cloud.logto.io/api';

const adminTenantId = 'admin';

const invokeCustomJwtWorkersCloudScopeName = 'invoke:custom:jwt:workers';
const invokeCustomJwtWorkersCloudScopeDescription =
  'Allow accessing custom JWT workers to fetch the parsed token payload.';

const alteration: AlterationScript = {
  up: async (pool) => {
    // Get the Cloud API resource
    const cloudApiResource = await pool.one<Resource>(sql`
      select * from resources
      where tenant_id = ${adminTenantId}
      and indicator = ${cloudApiIndicator}
    `);

    // Create the `invoke:custom:jwt:workers` scope
    await pool.query(sql`
      insert into scopes (id, tenant_id, resource_id, name, description)
      values (${generateStandardId()}, ${adminTenantId}, ${
        cloudApiResource.id
      }, ${invokeCustomJwtWorkersCloudScopeName}, ${invokeCustomJwtWorkersCloudScopeDescription});
    `);
  },
  down: async (pool) => {
    // Get the Cloud API resource
    const cloudApiResource = await pool.one<Resource>(sql`
      select * from resources
      where tenant_id = ${adminTenantId}
      and indicator = ${cloudApiIndicator}
    `);

    // Remove the `invoke:custom:jwt:workers` scope
    await pool.query(sql`
      delete from scopes
      where
        tenant_id = ${adminTenantId} and
        name = ${invokeCustomJwtWorkersCloudScopeName} and
        description = ${invokeCustomJwtWorkersCloudScopeDescription} and
        resource_id = ${cloudApiResource.id}
    `);
  },
};

export default alteration;
