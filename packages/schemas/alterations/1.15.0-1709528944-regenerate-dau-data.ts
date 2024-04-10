import { generateStandardId } from '@logto/shared/universal';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

type ActiveUserInteractionLog = {
  tenantId: string;
  userId: string;
  createdAt: number;
};

const alteration: AlterationScript = {
  up: async (pool) => {
    // Delete all record from `daily_active_users` table
    await pool.query(sql`delete from daily_active_users;`);

    // Retrieve all active user logs from `logs` table
    const { rows: interactionLogs } = await pool.query<ActiveUserInteractionLog>(sql`
      select tenant_id, payload->>'userId' as user_id, created_at
      from logs
      where payload->>'userId' is not null and key like 'ExchangeTokenBy.%' and payload->>'result' = 'Success'
    `);

    if (interactionLogs.length === 0) {
      console.log('No active user interaction logs found, skip alteration');
      return;
    }

    // Generate DAU data from active user logs
    for (const { tenantId, userId, createdAt } of interactionLogs) {
      /**
       * Note: we ignore the conflict here because conflict data may be inserted when staging.
       */
      // eslint-disable-next-line no-await-in-loop
      await pool.query(sql`
        insert into daily_active_users (id, tenant_id, user_id, date)
        values (${generateStandardId()},${tenantId}, ${userId}, ${new Date(
          createdAt
        ).toISOString()})
        on conflict do nothing;
      `);
    }
  },
  down: async (pool) => {
    // Cannot be reverted
  },
};

export default alteration;
