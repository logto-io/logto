import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences drop column custom_ui_asset_id;
      alter table sign_in_experiences add column custom_ui_assets jsonb;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences add column custom_ui_asset_id varchar(21);
      alter table sign_in_experiences drop column custom_ui_assets;
    `);
  },
};

export default alteration;
