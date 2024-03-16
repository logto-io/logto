import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    // [Pull] feat(core): machine to machine apps #1973
    await pool.query(sql`
      alter type application_type add value 'MachineToMachine';
      alter table applications add role_names jsonb not null default '[]'::jsonb;
    `);
  },
  down: async (pool) => {
    // [Pull] feat(core): machine to machine apps #1973
    await pool.query(sql`
      -- Drop role_names
      alter table applications drop role_names;

      -- Drop enum 'MachineToMachine'
      create type application_type_new as enum ('Native', 'SPA', 'Traditional');
      delete from applications where "type"='MachineToMachine';
      alter table applications
        alter column "type" type application_type_new
          using ("type"::text::application_type_new);
      drop type application_type;
      alter type application_type_new rename to application_type;
    `);
  },
};

export default alteration;
