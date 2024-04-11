import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const newScopeName = 'management-api:default';
const oldScopeName = 'default';
const recordId = 'management-api-scope';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      update scopes set name = ${newScopeName} where id = ${recordId}
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      update scopes set name = ${oldScopeName} where id = ${recordId}
    `);
  },
};

export default alteration;
