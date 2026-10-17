import { GlobalValues } from '@logto/shared';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

// The Logto Cloud API resource used to be a fixed host. It is now served by the instance itself, under
// `/api` on its endpoint. Point the seeded admin resource at that indicator, so tokens requested for it
// resolve to a resource this instance knows.
const legacyIndicator = 'https://cloud.meshx.app/api';

const alteration: AlterationScript = {
  up: async (pool) => {
    const indicator = `${new GlobalValues().adminUrlSet.endpoint.origin}/api`;

    await pool.query(sql`
      update resources set indicator = ${indicator}
      where tenant_id = 'admin' and indicator = ${legacyIndicator};
    `);
  },
  down: async (pool) => {
    const indicator = `${new GlobalValues().adminUrlSet.endpoint.origin}/api`;

    await pool.query(sql`
      update resources set indicator = ${legacyIndicator}
      where tenant_id = 'admin' and indicator = ${indicator};
    `);
  },
};

export default alteration;
