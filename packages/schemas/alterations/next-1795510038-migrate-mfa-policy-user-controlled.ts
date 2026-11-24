import { yes } from '@silverhand/essentials';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { withoutStatementTimeout } from './utils/1792569975-statement-timeout.js';
import { migrateMfaPolicyUserControlled } from './utils/1795510038-migrate-mfa-policy-user-controlled.js';

const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    await withoutStatementTimeout(pool, migrateMfaPolicyUserControlled);
  },
  up: async () => {
    /** Batches commit one by one, so the migration cannot run in this transaction. */
  },
  down: async (pool) => {
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
