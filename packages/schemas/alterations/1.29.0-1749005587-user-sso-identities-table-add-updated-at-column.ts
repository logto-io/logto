import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table user_sso_identities
        add column updated_at timestamptz not null default(now());
    `);

    await pool.query(sql`
      create trigger set_updated_at
        before update on user_sso_identities
        for each row
        execute procedure set_updated_at();
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop trigger set_updated_at on user_sso_identities;
    `);

    await pool.query(sql`
      alter table user_sso_identities
        drop column updated_at;
    `);
  },
};

export default alteration;
