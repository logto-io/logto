import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

/**
 * The script `next-1711955211-organization-resource-scope` was merged after `next-1712041436-rename-organization-member-role-to-collaborator`,
 * so the table `organization_role_resource_scope_relations` may not be created in the database.
 * This script is to fix the issue, try to create the table if it is not exists.
 */

const alteration: AlterationScript = {
  up: async (pool) => {
    const result = await pool.maybeOne(sql`
      select * from information_schema.tables 
      where table_name = 'organization_role_resource_scope_relations'
    `);

    if (result) {
      // The table already exists, do nothing
      return;
    }

    await pool.query(sql`
      create table organization_role_resource_scope_relations (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        organization_role_id varchar(21) not null
          references organization_roles (id) on update cascade on delete cascade,
        scope_id varchar(21) not null
          references scopes (id) on update cascade on delete cascade,
        primary key (tenant_id, organization_role_id, scope_id)
      );
    `);
    await applyTableRls(pool, 'organization_role_resource_scope_relations');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'organization_role_resource_scope_relations');
    await pool.query(sql`
      drop table organization_role_resource_scope_relations
    `);
  },
};

export default alteration;
