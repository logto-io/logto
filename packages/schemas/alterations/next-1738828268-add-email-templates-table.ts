import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table email_templates (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        id varchar(21) not null,
        language_tag varchar(16) not null,
        template_type varchar(64) not null,
        details jsonb not null,
        created_at timestamptz not null default now(),
        primary key (tenant_id, id),
        constraint email_templates__tenant_id__language_tag__template_type
          unique (tenant_id, language_tag, template_type)
      );

      create index email_templates__tenant_id__language_tag
        on email_templates (tenant_id, language_tag);

      create index email_templates__tenant_id__template_type
        on email_templates (tenant_id, template_type);
    `);

    await applyTableRls(pool, 'email_templates');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'email_templates');
    await pool.query(sql`
      drop table if exists email_templates;
    `);
  },
};

export default alteration;
