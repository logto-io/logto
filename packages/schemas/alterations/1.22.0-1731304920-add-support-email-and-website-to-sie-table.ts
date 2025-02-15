import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences
        add column support_email text,
        add column support_website_url text;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences
        drop column support_email,
        drop column support_website_url;
    `);
  },
};

export default alteration;
