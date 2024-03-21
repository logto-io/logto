import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table users
        add column profile jsonb not null default '{}'::jsonb,
        add column updated_at timestamptz not null default (now());
    `);
    await pool.query(sql`
      create function set_updated_at() returns trigger as
      $$ begin
        new.updated_at = now();
        return new;
      end; $$ language plpgsql;

      create trigger set_updated_at
        before update on users
        for each row
        execute procedure set_updated_at();
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table users
        drop column profile,
        drop column updated_at;
    `);
    await pool.query(sql`
      drop trigger set_updated_at on users;
      drop function set_updated_at();
    `);
  },
};

export default alteration;
