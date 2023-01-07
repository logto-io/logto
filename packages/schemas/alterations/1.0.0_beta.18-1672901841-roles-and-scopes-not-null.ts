import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      ALTER TABLE roles_scopes ALTER COLUMN role_id SET NOT NULL;
      ALTER TABLE roles_scopes ALTER COLUMN scope_id SET NOT NULL;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      ALTER TABLE roles_scopes ALTER COLUMN role_id DROP NOT NULL;
      ALTER TABLE roles_scopes ALTER COLUMN scope_id DROP NOT NULL;
    `);
  },
};

export default alteration;
