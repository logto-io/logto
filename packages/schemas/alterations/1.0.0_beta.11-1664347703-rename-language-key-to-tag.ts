import { sql } from 'slonik';

import { AlterationScript } from '../lib/types/alteration';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`alter table custom_phrases rename column language_key to language_tag;`);
  },
  down: async (pool) => {
    await pool.query(sql`alter table custom_phrases rename column language_tag to language_key;`);
  },
};

export default alteration;
