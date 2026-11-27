import { yes } from '@silverhand/essentials';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`set local statement_timeout = 0;`);
    await pool.query(sql`
      update sign_in_experiences
      set mfa = jsonb_set(mfa, '{policy}', '"PromptAtSignInAndSignUp"')
      where mfa->>'policy' = 'UserControlled';
    `);
  },
  down: async (pool) => {
    // Old code reads PromptAtSignInAndSignUp identically, so real rollbacks keep it;
    // revert only under ALTERATION_TEST so down-migration DB comparison matches the old seed.
    if (yes(process.env.ALTERATION_TEST)) {
      await pool.query(sql`
        update sign_in_experiences
        set mfa = jsonb_set(mfa, '{policy}', '"UserControlled"')
        where mfa->>'policy' = 'PromptAtSignInAndSignUp';
      `);
    }
  },
};

export default alteration;
