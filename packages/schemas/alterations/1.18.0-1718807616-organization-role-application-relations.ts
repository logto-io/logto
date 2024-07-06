import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table organization_role_application_relations (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        organization_id varchar(21) not null,
        organization_role_id varchar(21) not null
          references organization_roles (id) on update cascade on delete cascade,
        application_id varchar(21) not null,
        primary key (tenant_id, organization_id, organization_role_id, application_id),
        /** Application's roles in an organization should be synchronized with the application's membership in the organization. */
        foreign key (tenant_id, organization_id, application_id)
          references organization_application_relations (tenant_id, organization_id, application_id)
          on update cascade on delete cascade
      );
    `);
    await applyTableRls(pool, 'organization_role_application_relations');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'organization_role_application_relations');
    await pool.query(sql`
      drop table organization_role_application_relations;
    `);
  },
};

export default alteration;
