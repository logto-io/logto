import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table captcha_providers (
        tenant_id varchar(21) not null 
          references tenants (id) on update cascade on delete cascade,
        id varchar(128) not null,
        config jsonb /* @use CaptchaConfig */ not null default '{}'::jsonb,
        created_at timestamptz not null default(now()),
        updated_at timestamptz not null default(now()),
        primary key (id),
        unique (tenant_id)
      );

      create index captcha_providers__id
        on captcha_providers (tenant_id, id);
    `);
    await applyTableRls(pool, 'captcha_providers');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'captcha_providers');
    await pool.query(sql`
      drop table captcha_providers;
    `);
  },
};

export default alteration;
