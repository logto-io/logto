import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter type users_password_encryption_method add value 'sha1';
      alter type users_password_encryption_method add value 'sha256';
      alter type users_password_encryption_method add value 'md5';
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      create type users_password_encryption_method_revised as enum ('Argon2i');

      alter table users 
      alter column encryption_method type users_password_encryption_method_revised 
      using encryption_method::text::users_password_encryption_method_revised;

      drop type users_password_encryption_method;
      alter type users_password_encryption_method_revised rename to users_password_encryption_method;
    `);
  },
};

export default alteration;
