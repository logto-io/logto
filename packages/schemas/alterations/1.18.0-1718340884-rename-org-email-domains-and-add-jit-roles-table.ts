import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table organization_email_domains rename to organization_jit_email_domains;
      alter table organization_jit_email_domains
        rename constraint organization_email_domains_organization_id_fkey to organization_jit_email_domains_organization_id_fkey;
      alter table organization_jit_email_domains
        rename constraint organization_email_domains_pkey to organization_jit_email_domains_pkey;
      alter table organization_jit_email_domains
        rename constraint organization_email_domains_tenant_id_fkey to organization_jit_email_domains_tenant_id_fkey;
      alter policy organization_email_domains_modification
        on organization_jit_email_domains rename to organization_jit_email_domains_modification;
      alter policy organization_email_domains_tenant_id
        on organization_jit_email_domains rename to organization_jit_email_domains_tenant_id;
      create table organization_jit_roles (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        /** The ID of the organization. */
        organization_id varchar(21) not null
          references organizations (id) on update cascade on delete cascade,
        /** The organization role ID that will be automatically provisioned. */
        organization_role_id varchar(21) not null
          references organization_roles (id) on update cascade on delete cascade,
        primary key (tenant_id, organization_id, organization_role_id)
      );
    `);
    await applyTableRls(pool, 'organization_jit_roles');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'organization_jit_roles');
    await pool.query(sql`
      drop table organization_jit_roles
    `);
    await pool.query(sql`
      alter table organization_jit_email_domains rename to organization_email_domains;
      alter table organization_email_domains
        rename constraint organization_jit_email_domains_organization_id_fkey to organization_email_domains_organization_id_fkey;
      alter table organization_email_domains
        rename constraint organization_jit_email_domains_pkey to organization_email_domains_pkey;
      alter table organization_email_domains
        rename constraint organization_jit_email_domains_tenant_id_fkey to organization_email_domains_tenant_id_fkey;
      alter policy organization_jit_email_domains_modification 
        on organization_email_domains rename to organization_email_domains_modification;
      alter policy organization_jit_email_domains_tenant_id
        on organization_email_domains rename to organization_email_domains_tenant_id;
    `);
  },
};

export default alteration;
