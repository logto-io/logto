import { generateStandardId } from '@logto/shared/universal';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const adminTenantId = 'admin';

const addApiData = async (pool: CommonQueryMethods) => {
  const adminApi = {
    resourceId: generateStandardId(),
    scopeId: generateStandardId(),
  };
  const cloudApi = {
    resourceId: generateStandardId(),
    scopeId: generateStandardId(),
  };
  const adminRole = {
    id: generateStandardId(),
    name: 'admin:admin',
    description: 'Admin role for Logto.',
  };

  await pool.query(sql`
    insert into resources (tenant_id, id, indicator, name)
      values (
        ${adminTenantId},
        ${adminApi.resourceId},
        'https://admin.logto.app/api',
        'Logto Management API for tenant admin'
      ), (
        ${adminTenantId},
        ${cloudApi.resourceId},
        'https://cloud.logto.io/api',
        'Logto Cloud API'
      );
  `);
  await pool.query(sql`
    insert into scopes (tenant_id, id, name, description, resource_id)
      values (
        ${adminTenantId},
        ${adminApi.scopeId},
        'all',
        'Default scope for Management API, allows all permissions.',
        ${adminApi.resourceId}
      ), (
        ${adminTenantId},
        ${cloudApi.scopeId},
        'create:tenant',
        'Allow creating new tenants.',
        ${cloudApi.resourceId}
      );
  `);
  await pool.query(sql`
    insert into roles (tenant_id, id, name, description)
      values (
        ${adminTenantId},
        ${adminRole.id},
        ${adminRole.name},
        ${adminRole.description}
      );
  `);

  const { id: userRoleId } = await pool.one<{ id: string }>(sql`
    select id from roles
    where tenant_id = ${adminTenantId}
    and name = 'user'
  `);

  await pool.query(sql`
    insert into roles_scopes (tenant_id, id, role_id, scope_id)
      values (
        ${adminTenantId},
        ${generateStandardId()},
        ${userRoleId},
        ${cloudApi.scopeId}
      ), (
        ${adminTenantId},
        ${generateStandardId()},
        ${adminRole.id},
        ${adminApi.scopeId}
      );
  `);
};

const alteration: AlterationScript = {
  up: async (pool) => {
    await addApiData(pool);
    await pool.query(sql`
      insert into logto_configs (tenant_id, key, value)
      values (
        ${adminTenantId},
        'adminConsole',
        ${sql.jsonb({
          language: 'en',
          appearanceMode: 'system',
          livePreviewChecked: false,
          applicationCreated: false,
          signInExperienceCustomized: false,
          passwordlessConfigured: false,
          selfHostingChecked: false,
          communityChecked: false,
          m2mApplicationCreated: false,
        })}
      );
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      delete from resources
        where tenant_id = ${adminTenantId}
        and indicator in ('https://admin.logto.app/api', 'https://cloud.logto.io/api');
    `);
    await pool.query(sql`
      delete from roles
        where tenant_id = ${adminTenantId}
        and name = 'admin:admin';
    `);
    await pool.query(sql`
      delete from logto_configs
        where tenant_id = ${adminTenantId}
        and key = 'adminConsole';
    `);
  },
};

export default alteration;
