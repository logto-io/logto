import { yes } from '@silverhand/essentials';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const isCi = yes(process.env.CI);

const alteration: AlterationScript = {
  up: async (pool) => {
    // Create type
    await pool.query(sql`
      create type agree_to_terms_policy as enum ('Automatic', 'ManualRegistrationOnly', 'Manual');
    `);

    if (isCi) {
      // Direct set default to 'Automatic' to align with the sql table definition when running CI
      await pool.query(sql`
        alter table sign_in_experiences add column agree_to_terms_policy agree_to_terms_policy not null default 'Automatic';
      `);
    } else {
      // For compatibility with existing data, default to 'ManualRegistrationOnly'
      await pool.query(sql`
        alter table sign_in_experiences add column agree_to_terms_policy agree_to_terms_policy not null default 'ManualRegistrationOnly';
      `);

      // For new data, default to 'Automatic'
      await pool.query(sql`
        alter table sign_in_experiences alter column agree_to_terms_policy set default 'Automatic';
      `);
    }
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences drop column agree_to_terms_policy;
      drop type agree_to_terms_policy;
    `);
  },
};

export default alteration;
