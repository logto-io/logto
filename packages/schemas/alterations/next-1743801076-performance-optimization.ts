/**
 * @fileoverview This alteration optimizes the performance by creating indexes for often queried
 * columns.
 */

import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create index resources__indicator
        on resources (tenant_id, indicator);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop index if exists resources__indicator;
    `);
  },
};

export default alteration;
