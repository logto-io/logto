import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
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
    const result = await pool.maybeOne(sql`
      select * from information_schema.tables 
      where table_name = 'organization_role_resource_scope_relations'
    `);

    if (!result) {
      return;
    }

    await dropTableRls(pool, 'organization_role_resource_scope_relations');
    await pool.query(sql`
      drop table organization_role_resource_scope_relations
    `);
  },
};

export default alteration;
