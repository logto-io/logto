import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

/** The alteration script for adding `sso_identities` column to the users table. */
const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table user_sso_identities (
        tenant_id varchar(21) not null
          references tenants (id) on delete cascade,
        user_id varchar(21) not null
          references users (id) on delete cascade,
        issuer varchar(256) not null,
        identity_id varchar(128) not null,
        detail jsonb not null default '{}'::jsonb,
        primary key (tenant_id, issuer, identity_id)
      );
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop table user_sso_identities;
    `);
  },
};

export default alteration;
