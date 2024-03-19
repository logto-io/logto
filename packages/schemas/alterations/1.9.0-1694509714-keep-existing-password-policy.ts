import { yes } from '@silverhand/essentials';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

// In the alteration testing environment, we do not want to run this alteration
// script since it alters the existing data which does not match the new policy.
const isAlterationTesting = yes(process.env.ALTERATION_TEST);

/**
 * Note: The legacy password policy does not separate upper and lower cases into
 * different character types. It is not possible to migrate this behavior.
 */
const legacyPasswordPolicy = {
  length: { min: 8 },
  characterTypes: { min: 2 },
  rejects: {
    pwned: false,
    repetitionAndSequence: false,
    userInfo: false,
    words: [],
  },
};

const alteration: AlterationScript = {
  up: async (pool) => {
    if (isAlterationTesting) {
      console.warn(
        'Skipping alteration script next-1694509714-keep-existing-password-policy in alteration testing environment.'
      );
      return;
    }

    await pool.query(sql`
      update sign_in_experiences
        set password_policy = ${sql.jsonb(legacyPasswordPolicy)};
    `);
  },
  down: async (pool) => {
    if (isAlterationTesting) {
      console.warn(
        'Skipping alteration script next-1694509714-keep-existing-password-policy in alteration testing environment.'
      );
      return;
    }

    await pool.query(sql`
      update sign_in_experiences
        set password_policy = '{}'::jsonb;
    `);
  },
};

export default alteration;
