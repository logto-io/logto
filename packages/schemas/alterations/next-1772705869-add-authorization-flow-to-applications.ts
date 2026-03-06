import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create type application_authorization_flow as enum ('AuthorizationCode', 'DeviceFlow');

      alter table applications
        add column authorization_flow application_authorization_flow not null default 'AuthorizationCode';
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table applications
        drop column authorization_flow;

      drop type application_authorization_flow;
    `);
  },
};

export default alteration;
