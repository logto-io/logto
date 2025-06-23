import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table users alter column password_encrypted set data type varchar(256);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table users alter column password_encrypted set data type varchar(128);
    `);
  },
};

export default alteration;
