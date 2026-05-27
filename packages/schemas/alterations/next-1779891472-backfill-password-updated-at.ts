import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../src/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      update users
      set password_updated_at = now()
      where password_encrypted is not null and password_updated_at is null
    `);
  },
  down: async () => {
    // No-op: password timestamp backfills cannot be safely distinguished from user-driven updates.
  },
};

export default alteration;
