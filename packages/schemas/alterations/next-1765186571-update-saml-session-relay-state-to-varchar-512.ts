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
      alter column relay_state type varchar(512)
    `);
  },

  down: async (pool) => {
    // The down migration may fail or cause data loss if any existing relay_state values exceed 256 characters. Consider adding a USING clause to safely truncate values during rollback, this ensures the rollback operation won't fail due to data that's too long for the varchar(256) constraint.
    await pool.query(sql`
      alter table saml_application_sessions
      alter column relay_state type varchar(256) using left(relay_state, 256)
    `);
  },
};

export default alteration;
