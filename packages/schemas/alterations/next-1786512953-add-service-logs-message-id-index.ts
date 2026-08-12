import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    await pool.query(sql`
      create index concurrently service_logs__email__provider_message_id
        on service_logs ((payload->>'providerMessageId'))
        where type = 'sendEmail' and payload->>'providerMessageId' is not null;
    `);
  },
  up: async () => {
    /** 'concurrently' cannot be used inside a transaction, so this up is intentionally left empty. */
  },
  beforeDown: async (pool) => {
    await pool.query(sql`
      drop index concurrently service_logs__email__provider_message_id;
    `);
  },
  down: async () => {
    /** 'concurrently' cannot be used inside a transaction, so this down is intentionally left empty. */
  },
};

export default alteration;
