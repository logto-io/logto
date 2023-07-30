import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences rename column social_sign_in_connector_targets to sign_in_connector_targets
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences rename column sign_in_connector_targets to social_sign_in_connector_targets
    `);
  },
};

export default alteration;
