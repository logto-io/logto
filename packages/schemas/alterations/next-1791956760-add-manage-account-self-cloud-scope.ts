import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { generateStandardId } from './utils/1716643968-id-generation.js';

type Resource = {
  id: string;
};

type Role = {
  id: string;
};

type Scope = {
  id: string;
};

const adminTenantId = 'admin';
const cloudApiIndicator = 'https://cloud.logto.io/api';
const userRoleName = 'user';
const manageAccountSelfScopeName = 'manage:account:self';
const manageAccountSelfScopeDescription =
  'Allow managing account-level resources that are not tied to a tenant, including account deletion, billing, licenses, Console SSO, and invitations.';

const alteration: AlterationScript = {
  up: async (pool) => {
    // Cloud region databases other than the admin tenant's own have no `admin` tenant or Cloud API resource.
    const cloudApiResource = await pool.maybeOne<Resource>(sql`
      select id from resources
      where tenant_id = ${adminTenantId}
      and indicator = ${cloudApiIndicator}
    `);

    if (!cloudApiResource) {
      return;
    }

    const userRole = await pool.one<Role>(sql`
      select id from roles
      where tenant_id = ${adminTenantId}
      and name = ${userRoleName}
      and type = 'User'
    `);

    const manageAccountSelfScope = await pool.one<Scope>(sql`
      insert into scopes (id, tenant_id, resource_id, name, description)
      values (
        ${generateStandardId()},
        ${adminTenantId},
        ${cloudApiResource.id},
        ${manageAccountSelfScopeName},
        ${manageAccountSelfScopeDescription}
      )
      on conflict (tenant_id, resource_id, name) do update
        set description = excluded.description
      returning id;
    `);

    await pool.query(sql`
      insert into roles_scopes (id, tenant_id, role_id, scope_id)
      values (
        ${generateStandardId()},
        ${adminTenantId},
        ${userRole.id},
        ${manageAccountSelfScope.id}
      )
      on conflict (tenant_id, role_id, scope_id) do nothing;
    `);
  },
  down: async (pool) => {
    const cloudApiResource = await pool.maybeOne<Resource>(sql`
      select id from resources
      where tenant_id = ${adminTenantId}
      and indicator = ${cloudApiIndicator}
    `);

    if (!cloudApiResource) {
      return;
    }

    await pool.query(sql`
      delete from scopes
      where tenant_id = ${adminTenantId}
      and resource_id = ${cloudApiResource.id}
      and name = ${manageAccountSelfScopeName};
    `);
  },
};

export default alteration;
