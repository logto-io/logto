import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    // Password expiration (from PR #8643)
    await pool.query(sql`
      alter table users add column if not exists password_updated_at timestamptz;
      alter table sign_in_experiences add column if not exists password_expiration jsonb not null default '{}'::jsonb;
      alter table users add column if not exists is_password_expired boolean not null default false;
    `);

    // Session last_active_at (our PR #8748)
    await pool.query(sql`
      alter table oidc_session_extensions add column if not exists last_active_at timestamptz
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table users drop column if exists password_updated_at;
      alter table sign_in_experiences drop column if exists password_expiration;
      alter table users drop column if exists is_password_expired;
      alter table oidc_session_extensions drop column if exists last_active_at;
    `);
  },
};

export default alteration;
