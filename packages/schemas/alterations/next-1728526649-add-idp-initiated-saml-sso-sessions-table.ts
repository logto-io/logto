import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table idp_initiated_saml_sso_sessions (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        /** The globally unique identifier of the assertion record. */
        id varchar(21) not null,
        /** The identifier of the SAML SSO connector. */
        connector_id varchar(128) not null
          references sso_connectors (id) on update cascade on delete cascade,
        /** The SAML assertion. */
        assertion_content jsonb /* @use SsoSamlAssertionContent */ not null default '{}'::jsonb,
        created_at timestamptz not null default(now()),
        /** The expiration time of the assertion. */
        expires_at timestamptz not null,
        primary key (tenant_id, id)
      );
    `);
    await applyTableRls(pool, 'idp_initiated_saml_sso_sessions');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'idp_initiated_saml_sso_sessions');
    await pool.query(sql`
      drop table idp_initiated_saml_sso_sessions;
    `);
  },
};

export default alteration;
