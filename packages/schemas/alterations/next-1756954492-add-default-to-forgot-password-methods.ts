import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    // Set default value for new rows, but keep the column nullable
    // to preserve existing null values as migration markers
    await pool.query(sql`
      alter table sign_in_experiences
        alter column forgot_password_methods set default '[]'::jsonb;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences
        alter column forgot_password_methods drop default;
    `);
  },
};

export default alteration;
