import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table saml_application_configs (
        application_id varchar(21) not null
          references applications (id) on update cascade on delete cascade,
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        attribute_mapping jsonb /* @use SamlAttributeMapping */ not null default '{}'::jsonb,
        entity_id varchar(128),
        acs_url jsonb /* @use SamlAcsUrl */,
        primary key (tenant_id, application_id),
        constraint application_type
          check (check_application_type(application_id, 'SAML'))
      );
    `);
    await applyTableRls(pool, 'saml_application_configs');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'saml_application_configs');
    await pool.query(sql`
      drop table saml_application_configs;
    `);
  },
};

export default alteration;
