import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table saml_application_sessions (
        tenant_id varchar(21) not null 
          references tenants (id) on update cascade on delete cascade,
        id varchar(32) not null,
        application_id varchar(21) not null 
          references applications (id) on update cascade on delete cascade,
        saml_request_id varchar(128) not null,
        oidc_state varchar(32),
        relay_state varchar(256),
        raw_auth_request text not null,
        created_at timestamptz not null default(now()),
        expires_at timestamptz not null,
        primary key (tenant_id, id),
        constraint saml_application_sessions__application_type 
          check (check_application_type(application_id, 'SAML'))
      );
    `);
    await applyTableRls(pool, 'saml_application_sessions');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'saml_application_sessions');
    await pool.query(sql`
      drop table if exists saml_application_sessions;
    `);
  },
};

export default alteration;
