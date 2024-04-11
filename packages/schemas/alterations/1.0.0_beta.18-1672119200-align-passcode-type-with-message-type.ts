import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table passcodes alter column "type" type varchar(32);
      drop type passcode_type;
      create index passcodes__interaction_jti_type
      on passcodes (
        interaction_jti,
        type
      );
    `);
  },
  down: async (pool) => {
    // We don't handle potential type casting failures here as they need to be handled manually
    await pool.query(sql`
      create type passcode_type as enum ('SignIn', 'Register', 'ForgotPassword', 'Continue');
      drop index passcodes__interaction_jti_type;
      alter table passcodes alter column "type" type passcode_type using type::passcode_type;
    `);
  },
};

export default alteration;
