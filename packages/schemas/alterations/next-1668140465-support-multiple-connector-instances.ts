import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      ALTER TABLE connectors ADD COLUMN sync_profile boolean NOT NULL DEFAULT false;
      ALTER TABLE connectors ADD COLUMN connector_id varchar(128) NOT NULL;
      UPDATE TABLE connectors SET connector_id = id;
      ALTER TABLE connectors ADD COLUMN metadata jsonb NOT NULL DEFAULT '{}'::jsonb;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      ALTER TABLE connectors DROP COLUMN metadata;
      ALTER TABLE connectors DROP COLUMN connector_id;
      ALTER TABLE connectors DROP COLUMN sync_profile;
    `);
  },
};

export default alteration;
