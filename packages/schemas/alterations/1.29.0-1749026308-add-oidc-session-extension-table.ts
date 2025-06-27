import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table oidc_session_extensions (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        session_uid varchar(128) not null,
        account_id varchar(12) not null
          references users (id) on update cascade on delete cascade,
        last_submission jsonb /* @use JsonObject */ not null default '{}'::jsonb,
        created_at timestamptz not null default(now()),
        updated_at timestamptz not null default(now()),
        primary key (tenant_id, session_uid)
      );
    `);

    await pool.query(sql`
      create trigger set_updated_at
        before update on oidc_session_extensions
        for each row
        execute procedure set_updated_at();
    `);

    await applyTableRls(pool, 'oidc_session_extensions');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'oidc_session_extensions');

    await pool.query(sql`
      drop table oidc_session_extensions;
    `);
  },
};

export default alteration;
