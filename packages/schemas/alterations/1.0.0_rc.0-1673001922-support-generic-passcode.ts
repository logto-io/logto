import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table passcodes alter column interaction_jti drop not null;
      create index passcodes__email_type on passcodes (email, type);
      create index passcodes__phone_type on passcodes (phone, type);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      delete from passcodes where interaction_jti is null;
      drop index passcodes__email_type;
      drop index passcodes__phone_type;
      alter table passcodes alter column interaction_jti set not null;
    `);
  },
};

export default alteration;
