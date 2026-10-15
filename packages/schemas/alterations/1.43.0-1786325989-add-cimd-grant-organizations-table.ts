import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

/**
 * Add the grant-scoped organization authorization table for client ID metadata document (CIMD)
 * clients. CIMD clients are unregistered URL identities with no deletion lifecycle and
 * transferable ownership, so organization access follows the single authorization instead of a
 * long-lived cross-grant relation: rows cascade away with the Grant row (revocation hard-deletes
 * it) and with the user's organization membership.
 */
const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table cimd_grant_organizations (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        grant_id varchar(128) not null,
        grant_model_name varchar(64) not null default 'Grant',
        organization_id varchar(21) not null,
        user_id varchar(21) not null,
        primary key (tenant_id, grant_id, organization_id),
        constraint cimd_grant_organizations__grant_model_name
          check (grant_model_name = 'Grant'),
        foreign key (tenant_id, grant_model_name, grant_id)
          references oidc_model_instances (tenant_id, model_name, id)
          on update cascade on delete cascade,
        foreign key (tenant_id, organization_id, user_id)
          references organization_user_relations (tenant_id, organization_id, user_id)
          on update cascade on delete cascade
      );
    `);
    /**
     * Backs the membership FK's cascade lookup; the PK leaves `organization_id` outside its
     * usable prefix. The table is created empty in this transaction, so a plain (non-concurrent)
     * index build is free.
     */
    await pool.query(sql`
      create index cimd_grant_organizations__organization_id_user_id
        on cimd_grant_organizations (tenant_id, organization_id, user_id);
    `);
    await applyTableRls(pool, 'cimd_grant_organizations');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'cimd_grant_organizations');
    await pool.query(sql`
      drop table cimd_grant_organizations;
    `);
  },
};

export default alteration;
