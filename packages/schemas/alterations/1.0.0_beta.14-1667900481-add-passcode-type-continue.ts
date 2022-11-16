import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter type passcode_type add value 'Continue'
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop type passcode_type
      create type passcode_type as enum ('SignIn', 'Register', 'ForgotPassword');
    `);
  },
};

export default alteration;
