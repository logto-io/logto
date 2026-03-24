import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const legacyMandatoryPolicy = 'Mandatory';
const normalizedMandatoryPolicy = 'PromptAtSignInAndSignUpMandatory';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      update sign_in_experiences
      set mfa = jsonb_set(mfa, '{policy}', ${JSON.stringify(normalizedMandatoryPolicy)}::jsonb)
      where mfa ->> 'policy' = ${legacyMandatoryPolicy}
    `);
  },
  down: async () => {
    // No-op: the normalized policy may already be a legitimate post-migration value.
  },
};

export default alteration;
