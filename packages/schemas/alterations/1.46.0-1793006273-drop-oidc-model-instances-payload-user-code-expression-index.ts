import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { withoutStatementTimeout } from './utils/1792569975-statement-timeout.js';

const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    // `if exists` so a rerun after a drop that finished without recording the alteration state
    // continues instead of failing; a missing index hides nothing here, unlike a leftover create.
    await withoutStatementTimeout(pool, async (connection) => {
      await connection.query(
        sql`drop index concurrently if exists oidc_model_instances__model_name_payload_user_code;`
      );
    });
  },
  up: async () => {
    /** `concurrently` cannot run inside a transaction. */
  },
  beforeDown: async (pool) => {
    await withoutStatementTimeout(pool, async (connection) => {
      await connection.query(sql`
        create index concurrently oidc_model_instances__model_name_payload_user_code
          on oidc_model_instances (tenant_id, model_name, (payload->>'userCode'));
      `);
    });
  },
  down: async () => {
    /** `concurrently` cannot run inside a transaction. */
  },
};

export default alteration;
