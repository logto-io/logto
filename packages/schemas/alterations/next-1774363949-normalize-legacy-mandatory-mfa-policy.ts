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
  down: async (pool) => {
    // Only revert records that still represent the old "mandatory MFA" semantics.
    // `PromptAtSignInAndSignUpMandatory` is also a valid canonical policy for adaptive MFA,
    // so reverting rows with adaptive MFA enabled would incorrectly destroy legitimate data.
    // We therefore roll back only the non-adaptive rows that this migration normalized.
    await pool.query(sql`
      update sign_in_experiences
      set mfa = jsonb_set(mfa, '{policy}', ${JSON.stringify(legacyMandatoryPolicy)}::jsonb)
      where mfa ->> 'policy' = ${normalizedMandatoryPolicy}
        and coalesce(adaptive_mfa ->> 'enabled', 'false') <> 'true'
    `);
  },
};

export default alteration;
