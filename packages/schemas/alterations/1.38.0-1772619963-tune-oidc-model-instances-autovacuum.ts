import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table oidc_model_instances set (
        autovacuum_vacuum_scale_factor = 0.05,
        autovacuum_analyze_scale_factor = 0.02,
        autovacuum_vacuum_threshold = 5000,
        autovacuum_analyze_threshold = 2000
      );
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table oidc_model_instances reset (
        autovacuum_vacuum_scale_factor,
        autovacuum_analyze_scale_factor,
        autovacuum_vacuum_threshold,
        autovacuum_analyze_threshold
      );
    `);
  },
};

export default alteration;
