import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table users rename column password_encrypted to password_digest;
      alter table users rename column password_encryption_method to password_algorithm;
      alter type users_password_encryption_method rename to users_password_algorithm;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter type users_password_algorithm rename to users_password_encryption_method;
      alter table users rename column password_digest to password_encrypted;
      alter table users rename column password_algorithm to password_encryption_method;
    `);
  },
};

export default alteration;
