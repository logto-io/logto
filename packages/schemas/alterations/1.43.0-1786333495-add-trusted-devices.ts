import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table trusted_devices (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        id varchar(21) not null,
        user_id varchar(12) not null
          references users (id) on update cascade on delete cascade,
        secret_hash bytea not null,
        user_agent text,
        ip text,
        country varchar(16),
        city text,
        created_at timestamptz not null default(now()),
        last_used_at timestamptz not null default(now()),
        expires_at timestamptz not null,
        primary key (id)
      );

      create index trusted_devices__tenant_user_expires_at
        on trusted_devices (tenant_id, user_id, expires_at);

      create index trusted_devices__tenant_expires_at
        on trusted_devices (tenant_id, expires_at);

      alter table sign_in_experiences
        add column trusted_device jsonb not null default '{}'::jsonb;

      alter table organizations
        add column is_trusted_device_allowed boolean not null default true;
    `);

    await applyTableRls(pool, 'trusted_devices');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'trusted_devices');

    await pool.query(sql`
      drop table trusted_devices;

      alter table sign_in_experiences
        drop column trusted_device;

      alter table organizations
        drop column is_trusted_device_allowed;
    `);
  },
};

export default alteration;
