import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

// The encrypted bearer token an admin stores for one MCP server. The column holds ciphertext only:
// the portal decrypts it with the deployment's key when it connects to the server. The table is
// already scoped to the tenant with row-level security, so this column needs no policy of its own.
const upstreamTable = 'mcp_portal_upstreams';
const column = 'credential_ciphertext';

const alteration: AlterationScript = {
  up: async (pool: CommonQueryMethods) => {
    await pool.query(sql`
      alter table ${sql.identifier([upstreamTable])}
        add column if not exists ${sql.identifier([column])} text
    `);
  },
  down: async (pool: CommonQueryMethods) => {
    await pool.query(sql`
      alter table ${sql.identifier([upstreamTable])}
        drop column if exists ${sql.identifier([column])}
    `);
  },
};

export default alteration;
