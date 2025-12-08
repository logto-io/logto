import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

/**
 * Update saml_application_sessions.relay_state column type from varchar(256) to text
 * to support longer relay state values that may be used in SAML authentication flows.
 *
 * The relay state parameter in SAML can contain arbitrary data that needs to be
 * preserved and returned to the service provider, and 256 characters may not be
 * sufficient for all use cases.
 */

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table saml_application_sessions
      alter column relay_state type text
    `);
  },

  down: async (pool) => {
    // When rolling back, truncate to 256 characters if necessary
    await pool.query(sql`
      alter table saml_application_sessions
      alter column relay_state type varchar(256)
    `);
  },
};

export default alteration;
