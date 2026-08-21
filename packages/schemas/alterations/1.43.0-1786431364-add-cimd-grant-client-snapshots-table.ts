import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

/**
 * Add the per-grant client display snapshot table for client ID metadata document (CIMD) clients.
 * CIMD clients are unregistered URL identities without an `applications` row, and an unvetted
 * client can rewrite its hosted document at any time — so the grant list renders the snapshot
 * captured at consent instead of refetching the document. Rows cascade away with the Grant row.
 */
const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table cimd_grant_client_snapshots (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        grant_id varchar(128) not null,
        grant_model_name varchar(64) not null default 'Grant',
        client_id varchar(2048) not null,
        name varchar(256),
        logo_uri varchar(2048),
        created_at timestamptz not null default(now()),
        primary key (tenant_id, grant_id),
        constraint cimd_grant_client_snapshots__grant_model_name
          check (grant_model_name = 'Grant'),
        foreign key (tenant_id, grant_model_name, grant_id)
          references oidc_model_instances (tenant_id, model_name, id)
          on update cascade on delete cascade
      );
    `);
    await applyTableRls(pool, 'cimd_grant_client_snapshots');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'cimd_grant_client_snapshots');
    await pool.query(sql`
      drop table cimd_grant_client_snapshots;
    `);
  },
};

export default alteration;
