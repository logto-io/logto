import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table application_user_consent_organization_resource_scopes (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        /** The globally unique identifier of the application. */
        application_id varchar(21) not null
          references applications (id) on update cascade on delete cascade,
        /** The globally unique identifier of the resource scope. */
        scope_id varchar(21) not null
          references scopes (id) on update cascade on delete cascade,
        primary key (application_id, scope_id)
      );
    `);
    await applyTableRls(pool, 'application_user_consent_organization_resource_scopes');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'application_user_consent_organization_resource_scopes');
    await pool.query(sql`
      drop table application_user_consent_organization_resource_scopes
    `);
  },
};

export default alteration;
