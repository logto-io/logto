import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table organization_email_domains (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        /** The ID of the organization. */
        organization_id varchar(21) not null
          references organizations (id) on update cascade on delete cascade,
        /** The email domain that will be automatically provisioned. */
        email_domain varchar(128) not null,
        primary key (tenant_id, organization_id, email_domain)
      );
    `);
    await applyTableRls(pool, 'organization_email_domains');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'organization_email_domains');
    await pool.query(sql`
      drop table organization_email_domains
    `);
  },
};

export default alteration;
