import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter type application_type add value 'Protected';
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      create type application_type_new as enum ('Native', 'SPA', 'Traditional', 'MachineToMachine');
      delete from applications where "type"='Protected';
      alter table applications
        alter column "type" type application_type_new
          using ("type"::text::application_type_new);
      drop type application_type;
      alter type application_type_new rename to application_type;
    `);
  },
};

export default alteration;
