import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter type passcode_type add value 'Continue';
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      create type passcode_type_new as enum ('SignIn', 'Register', 'ForgotPassword');
      delete from passcodes where "type"='Continue';
      alter table passcodes
        alter column "type" type passcode_type_new
          using ("type"::text::passcode_type_new);
      drop type passcode_type;
      alter type passcode_type_new rename to passcode_type;
    `);
  },
};

export default alteration;
