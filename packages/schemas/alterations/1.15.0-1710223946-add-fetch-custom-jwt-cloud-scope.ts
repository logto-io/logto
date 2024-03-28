import { generateStandardId } from '@logto/shared/universal';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

type Resource = {
  tenantId: string;
  id: string;
  name: string;
  indicator: string;
  isDefault: boolean;
};

type Scope = {
  tenantId: string;
  id: string;
  resourceId: string;
  name: string;
  description: string;
};

type Role = {
  tenantId: string;
  id: string;
  name: string;
  description: string;
};

const cloudApiIndicator = 'https://cloud.logto.io/api';

const cloudConnectionAppRoleName = 'tenantApplication';

const adminTenantId = 'admin';

const fetchCustomJwtCloudScopeName = 'fetch:custom:jwt';
const fetchCustomJwtCloudScopeDescription =
  'Allow accessing external resource to execute JWT payload customizer script and fetch the parsed token payload.';

const alteration: AlterationScript = {
  up: async (pool) => {
    // Get the Cloud API resource
    const cloudApiResource = await pool.one<Resource>(sql`
      select * from resources
      where tenant_id = ${adminTenantId}
      and indicator = ${cloudApiIndicator}
    `);

    // Get cloud connection application role
    const tenantApplicationRole = await pool.one<Role>(sql`
      select * from roles
      where tenant_id = ${adminTenantId}
      and name = ${cloudConnectionAppRoleName} and type = 'MachineToMachine'
    `);

    // Create the `custom:jwt` scope
    const customJwtCloudScope = await pool.one<Scope>(sql`
      insert into scopes (id, tenant_id, resource_id, name, description)
      values (${generateStandardId()}, ${adminTenantId}, ${
        cloudApiResource.id
      }, ${fetchCustomJwtCloudScopeName}, ${fetchCustomJwtCloudScopeDescription})
      returning *;
    `);

    // Assign the `custom:jwt` scope to cloud connection application role
    await pool.query(sql`
      insert into roles_scopes (id, tenant_id, role_id, scope_id)
      values (${generateStandardId()}, ${adminTenantId}, ${tenantApplicationRole.id}, ${
        customJwtCloudScope.id
      });
    `);
  },
  down: async (pool) => {
    // Get the Cloud API resource
    const cloudApiResource = await pool.one<Resource>(sql`
      select * from resources
      where tenant_id = ${adminTenantId}
      and indicator = ${cloudApiIndicator}
    `);

    // Remove the `custom:jwt` scope
    await pool.query(sql`
      delete from scopes
      where
        tenant_id = ${adminTenantId} and
        name = ${fetchCustomJwtCloudScopeName} and
        description = ${fetchCustomJwtCloudScopeDescription} and
        resource_id = ${cloudApiResource.id}
    `);
  },
};

export default alteration;
