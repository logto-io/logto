import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    // [Pull] feat(core,schemas): add phrases schema and GET /custom-phrases/:languageKey route #1905
    await pool.query(sql`
      create table custom_phrases (
        language_key varchar(16) not null,
        translation jsonb not null,
        primary key(language_key)
      );
    `);
  },
  down: async (pool) => {
    // [Pull] feat(core,schemas): add phrases schema and GET /custom-phrases/:languageKey route #1905
    await pool.query(sql`drop table custom_phrases;`);
  },
};

export default alteration;
