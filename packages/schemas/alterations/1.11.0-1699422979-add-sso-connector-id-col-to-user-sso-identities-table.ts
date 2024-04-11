import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table user_sso_identities add column sso_connector_id varchar(128) not null references sso_connectors (id) on update cascade on delete cascade;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table user_sso_identities drop column sso_connector_id;
    `);
  },
};

export default alteration;
