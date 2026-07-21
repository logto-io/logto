import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table saml_sso_connector_signing_keys (
        id varchar(21) not null,
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        sso_connector_id varchar(128) not null
          references sso_connectors (id) on update cascade on delete cascade,
        private_key text not null,
        certificate text not null,
        created_at timestamptz not null default now(),
        expires_at timestamptz not null,
        active boolean not null,
        primary key (tenant_id, sso_connector_id, id)
      );

      create unique index saml_sso_connector_signing_keys__unique_active
        on saml_sso_connector_signing_keys (tenant_id, sso_connector_id, active)
        where active;
    `);
    await applyTableRls(pool, 'saml_sso_connector_signing_keys');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'saml_sso_connector_signing_keys');
    await pool.query(sql`
      drop table saml_sso_connector_signing_keys;
    `);
  },
};

export default alteration;
