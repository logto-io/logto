import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { generateStandardId } from './utils/1716643968-id-generation.js';

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

const reportSubscriptionUpdatesScopeName = 'report:subscription:updates';
const reportSubscriptionUpdatesScopeDescription =
  'Allow reporting changes on Stripe subscription to Logto Cloud.';

const alteration: AlterationScript = {
  up: async (pool) => {
    // Get the Cloud API resource
    const cloudApiResource = await pool.maybeOne<Resource>(sql`
      select * from resources
      where tenant_id = ${adminTenantId}
      and indicator = ${cloudApiIndicator}
    `);

    if (!cloudApiResource) {
      return;
    }

    // Get cloud connection application role
    const tenantApplicationRole = await pool.one<Role>(sql`
      select * from roles
      where tenant_id = ${adminTenantId}
      and name = ${cloudConnectionAppRoleName} and type = 'MachineToMachine'
    `);

    // Create the `report:subscription:updates` scope
    const reportSubscriptionUpdatesCloudScope = await pool.one<Scope>(sql`
      insert into scopes (id, tenant_id, resource_id, name, description)
      values (${generateStandardId()}, ${adminTenantId}, ${
        cloudApiResource.id
      }, ${reportSubscriptionUpdatesScopeName}, ${reportSubscriptionUpdatesScopeDescription})
      on conflict (tenant_id, name, resource_id) do nothing
      returning *;
    `);

    // Assign the `report:subscription:updates` scope to cloud connection application role
    await pool.query(sql`
      insert into roles_scopes (id, tenant_id, role_id, scope_id)
      values (${generateStandardId()}, ${adminTenantId}, ${tenantApplicationRole.id}, ${
        reportSubscriptionUpdatesCloudScope.id
      }) on conflict (tenant_id, role_id, scope_id) do nothing;
    `);
  },
  down: async (pool) => {
    // Get the Cloud API resource
    const cloudApiResource = await pool.maybeOne<Resource>(sql`
      select * from resources
      where tenant_id = ${adminTenantId}
      and indicator = ${cloudApiIndicator}
    `);

    if (!cloudApiResource) {
      return;
    }

    // Remove the `report:subscription:updates` scope
    await pool.query(sql`
      delete from scopes
      where
        tenant_id = ${adminTenantId} and
        name = ${reportSubscriptionUpdatesScopeName} and
        description = ${reportSubscriptionUpdatesScopeDescription} and
        resource_id = ${cloudApiResource.id}
    `);
  },
};

export default alteration;
