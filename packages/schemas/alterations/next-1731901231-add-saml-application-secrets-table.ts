import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table saml_application_secrets (
        id varchar(21) not null,
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        application_id varchar(21) not null
          references applications (id) on update cascade on delete cascade,
        private_key text not null,
        certificate text not null,
        created_at timestamptz not null default now(),
        expires_at timestamptz not null,
        active boolean not null,
        primary key (tenant_id, application_id, id),
        constraint application_type
          check (check_application_type(application_id, 'SAML'))
      );

      create unique index saml_application_secrets__unique_active_secret
        on saml_application_secrets (tenant_id, application_id, active)
        where active;
    `);
    await applyTableRls(pool, 'saml_application_secrets');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'saml_application_secrets');
    await pool.query(sql`
      drop table saml_application_secrets;
    `);
  },
};

export default alteration;
