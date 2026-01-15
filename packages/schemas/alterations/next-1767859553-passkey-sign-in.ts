import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences
        add column passkey_sign_in jsonb /* @use PasskeySignIn */ not null default '{}'::jsonb;
      create index users_mfa_verifications_gin on users using gin (mfa_verifications jsonb_path_ops);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences drop column passkey_sign_in;
      drop index users_mfa_verifications_gin;
    `);
  },
};

export default alteration;
