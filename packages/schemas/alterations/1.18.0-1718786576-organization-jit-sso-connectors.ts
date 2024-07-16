import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table organization_jit_sso_connectors (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        /** The ID of the organization. */
        organization_id varchar(21) not null
          references organizations (id) on update cascade on delete cascade,
        sso_connector_id varchar(128) not null
          references sso_connectors (id) on update cascade on delete cascade,
        primary key (tenant_id, organization_id, sso_connector_id)
      );
    `);
    await applyTableRls(pool, 'organization_jit_sso_connectors');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'organization_jit_sso_connectors');
    await pool.query(sql`
      drop table organization_jit_sso_connectors;
    `);
  },
};

export default alteration;
