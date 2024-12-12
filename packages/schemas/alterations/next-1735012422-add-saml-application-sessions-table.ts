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
        saml_request_id varchar(128),
        oidc_state varchar(32),
        is_oidc_state_checked boolean not null default false,
        is_saml_response_sent boolean not null default false,
        relay_state varchar(256),
        auth_request_info jsonb not null,
        created_at timestamptz not null default(now()),
        expires_at timestamptz not null,
        primary key (tenant_id, id),
        constraint saml_application_sessions__application_type 
          check (check_application_type(application_id, 'SAML'))
      );

      create unique index saml_application_sessions__oidc_state 
        on saml_application_sessions (tenant_id, oidc_state);
      create unique index saml_application_sessions__saml_request_id
        on saml_application_sessions (tenant_id, saml_request_id);
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
