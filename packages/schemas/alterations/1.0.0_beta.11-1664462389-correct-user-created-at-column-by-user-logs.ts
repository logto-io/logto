import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      update users
      set created_at = user_logs.registered_at
      from (
        select logs.payload ->> 'userId' as user_id, max(logs.created_at) as registered_at
        from logs
        where logs.type in ('RegisterUsernamePassword', 'RegisterEmail', 'RegisterSms', 'RegisterSocial')
        and logs.payload ->> 'result' = 'Success'
        group by logs.payload ->> 'userId'
      ) as user_logs
      where users.id = user_logs.user_id;
    `);
  },
  down: async (pool) => {
    // It cannot be reverted automatically.
  },
};

export default alteration;
