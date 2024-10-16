import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table sso_connector_idp_initiated_auth_configs
        add column client_idp_initiated_auth_callback_uri text;
      
      alter table sso_connector_idp_initiated_auth_configs
        add column auto_send_authorization_request boolean not null default false;

      alter table sso_connector_idp_initiated_auth_configs
        drop constraint application_type;

      alter table sso_connector_idp_initiated_auth_configs
        add constraint application_type
          check (check_application_type(default_application_id, 'Traditional', 'SPA'));
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sso_connector_idp_initiated_auth_configs
        drop constraint application_type;

      alter table sso_connector_idp_initiated_auth_configs
        drop column client_idp_initiated_auth_callback_uri;

      alter table sso_connector_idp_initiated_auth_configs
        drop column auto_send_authorization_request;

      alter table sso_connector_idp_initiated_auth_configs
        add constraint application_type
          check (check_application_type(default_application_id, 'Traditional'));
    `);
  },
};

export default alteration;
