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

    // Update default and admin tenant to [], bypass the alter comparison
    await pool.query(sql`
      update sign_in_experiences
      set forgot_password_methods = '[]'::jsonb
      where forgot_password_methods is null and (tenant_id = 'admin' or tenant_id = 'default');
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences
        alter column forgot_password_methods drop default;
    `);

    await pool.query(sql`
      update sign_in_experiences
      set forgot_password_methods = null
      where forgot_password_methods = '[]'::jsonb and (tenant_id = 'admin' or tenant_id = 'default');
    `);
  },
};

export default alteration;
