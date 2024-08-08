import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter type users_password_encryption_method add value 'Argon2id';
      alter type users_password_encryption_method add value 'Argon2d';
    `);
  },
  down: async (pool) => {
    const { rows } = await pool.query(sql`
      select id from users
      where password_encryption_method = ${'Argon2id'}
      or password_encryption_method = ${'Argon2d'}
    `);
    if (rows.length > 0) {
      throw new Error('There are users with password encryption methods Argon2id or Argon2d.');
    }

    await pool.query(sql`
      create type users_password_encryption_method_revised as enum ('Argon2i', 'SHA1', 'SHA256', 'MD5', 'Bcrypt');

      alter table users 
      alter column password_encryption_method type users_password_encryption_method_revised 
      using password_encryption_method::text::users_password_encryption_method_revised;

      drop type users_password_encryption_method;
      alter type users_password_encryption_method_revised rename to users_password_encryption_method;
    `);
  },
};

export default alteration;
