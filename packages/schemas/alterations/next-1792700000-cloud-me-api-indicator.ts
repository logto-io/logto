import { GlobalValues } from '@logto/shared';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

// Cloud's Me API used to be the fixed Logto host. In cloud it is served by the instance itself, at
// `<admin origin>/me`, so point the seeded resource there. OSS keeps its indicator, so this only runs
// on cloud instances.
const legacyIndicator = 'https://admin.logto.app/me';

const alteration: AlterationScript = {
  up: async (pool) => {
    const globalValues = new GlobalValues();

    if (!globalValues.isCloud) {
      return;
    }

    const indicator = `${globalValues.adminUrlSet.endpoint.origin}/me`;

    await pool.query(sql`
      update resources set indicator = ${indicator}
      where tenant_id = 'admin' and indicator = ${legacyIndicator};
    `);
  },
  down: async (pool) => {
    const globalValues = new GlobalValues();

    if (!globalValues.isCloud) {
      return;
    }

    const indicator = `${globalValues.adminUrlSet.endpoint.origin}/me`;

    await pool.query(sql`
      update resources set indicator = ${legacyIndicator}
      where tenant_id = 'admin' and indicator = ${indicator};
    `);
  },
};

export default alteration;
