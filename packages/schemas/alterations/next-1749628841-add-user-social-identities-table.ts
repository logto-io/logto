import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table user_social_identities (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        id varchar(21) not null,
        user_id varchar(12) not null
          references users (id) on update cascade on delete cascade,
        target varchar(256) not null,
        identity_id varchar(256) not null,
        connector_id varchar(128)
          references connectors (id) on update cascade on delete set null,
        details jsonb /* @use JsonObject */ not null default '{}'::jsonb,
        created_at timestamptz not null default(now()),
        updated_at timestamptz not null default(now()),
        primary key (tenant_id, id),
        constraint user_social_identities__target__identity_id
          unique (tenant_id, target, identity_id)
      );
    `);

    await pool.query(sql`
      create trigger set_updated_at
        before update on user_social_identities
        for each row
        execute procedure set_updated_at();
    `);

    await applyTableRls(pool, 'user_social_identities');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'user_social_identities');

    await pool.query(sql`
      drop table user_social_identities;
    `);
  },
};
export default alteration;
