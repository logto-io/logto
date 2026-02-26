import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      update users
      set logto_config = jsonb_set(
        jsonb_set(logto_config, '{mfa}', coalesce(logto_config->'mfa', '{}'::jsonb), true),
        '{mfa,enabled}',
        'true'::jsonb,
        true
      )
      where jsonb_array_length(mfa_verifications) > 0;
    `);
  },
  down: async (pool) => {
    // No down script available, this is a non-reversible operation
  },
};

export default alteration;
