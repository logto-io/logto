import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

// The function body must match `tables/logs.sql` exactly, indentation included:
// `.scripts/compare-database.js` compares `pg_get_functiondef` output.
const createSetPayloadKeysFunction = sql`
  create function logs__set_payload_keys() returns trigger as
$$ begin
  new.payload_user_id = new.payload->>'userId';
  new.payload_application_id = new.payload->>'applicationId';
  new.payload_hook_id = new.payload->>'hookId';
  return new;
end; $$ language plpgsql;
`;

const alteration: AlterationScript = {
  up: async (pool) => {
    // `alter table` is catalog-only but queues for an exclusive lock behind running queries, and
    // new traffic queues behind it; fail fast instead. One round trip keeps the lock short.
    await pool.query(sql`
      set local lock_timeout = '3s';
      alter table logs
        add column payload_user_id varchar(128),
        add column payload_application_id text,
        add column payload_hook_id varchar(21);
      ${createSetPayloadKeysFunction}
      create trigger logs__set_payload_keys
        before insert or update of payload, payload_user_id, payload_application_id, payload_hook_id
        on logs
        for each row execute procedure logs__set_payload_keys();
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      set local lock_timeout = '3s';
      drop trigger logs__set_payload_keys on logs;
      drop function logs__set_payload_keys;
      alter table logs
        drop column payload_user_id,
        drop column payload_application_id,
        drop column payload_hook_id;
    `);
  },
};

export default alteration;
