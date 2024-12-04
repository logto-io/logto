import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table sso_connector_idp_initiated_auth_configs
        drop constraint application_type;`);

    await pool.query(sql`
      alter table sso_connector_idp_initiated_auth_configs
        add constraint application_type
        check (check_application_type(default_application_id, 'Traditional', 'SPA', 'SAML'));
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sso_connector_idp_initiated_auth_configs
        drop constraint application_type;`);

    await pool.query(sql`
      alter table sso_connector_idp_initiated_auth_configs
        add constraint application_type
        check (check_application_type(default_application_id, 'Traditional', 'SPA'));
    `);
  },
};

export default alteration;
