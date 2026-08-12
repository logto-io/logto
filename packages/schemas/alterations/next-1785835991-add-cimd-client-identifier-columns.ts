import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

/**
 * Registered application IDs (21 chars, referencing `applications`) and CIMD (client ID metadata
 * document) client identifier URLs are different value spaces, so each gets its own column instead
 * of sharing one.
 */
const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table users
        add column cimd_client_id varchar(2048);

      alter table oidc_session_extensions
        add column cimd_client_id varchar(2048);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table users
        drop column cimd_client_id;

      alter table oidc_session_extensions
        drop column cimd_client_id;
    `);
  },
};

export default alteration;
