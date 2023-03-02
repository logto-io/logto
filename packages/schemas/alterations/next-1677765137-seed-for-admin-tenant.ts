import { generateStandardId } from '@logto/core-kit';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

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
        'Logto Management API for tenant admin'
      );
  `);
  await pool.query(sql`
    insert into scopes (tenant_id, id, name, description, resource_id)
      values (
        ${adminTenantId},
        ${adminApi.scopeId},
        'all',
        'Default scope for Management API, allows all permissions.',
        ${adminApi.scopeId}
      ), (
        ${adminTenantId},
        ${cloudApi.scopeId},
        'create:tenant',
        'Allow creating new tenants.',
        ${cloudApi.scopeId}
      );
  `);

  const { id: roleId } = await pool.one<{ id: string }>(sql`
    select id from roles
    where tenant_id = ${adminTenantId}
    and name = 'user'
  `);

  await pool.query(sql`
    insert into roles_scopes (tenant_id, id, role_id, scope_id)
      values (
        ${adminTenantId},
        ${generateStandardId()},
        ${roleId},
        ${adminApi.scopeId}
      ), (
        ${adminTenantId},
        ${generateStandardId()},
        ${roleId},
        ${cloudApi.scopeId}
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
      delete from applications
        where tenant_id = 'admin'
        and id = 'admin-console';
    `);
  },
};

export default alteration;
