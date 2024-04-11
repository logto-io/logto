import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      update users
      set custom_data = custom_data #- '{adminConsolePreferences, getStartedHidden}';
    `);
  },
  down: async () => {
    // Do nothing as the data change is not reversible
  },
};

export default alteration;
