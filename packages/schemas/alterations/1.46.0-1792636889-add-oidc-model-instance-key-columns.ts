import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

// The function body must match `tables/oidc_model_instances.sql` exactly, indentation included:
// `.scripts/compare-database.js` compares `pg_get_functiondef` output.
const createSetPayloadKeysFunction = sql`
  create function oidc_model_instances__set_payload_keys() returns trigger as
$$ begin
  new.payload_grant_id = new.payload->>'grantId';
  new.payload_account_id = new.payload->>'accountId';
  new.payload_uid = new.payload->>'uid';
  new.payload_user_code = new.payload->>'userCode';
  return new;
end; $$ language plpgsql;
`;

const alteration: AlterationScript = {
  up: async (pool) => {
    // `alter table` is catalog-only but queues for an exclusive lock behind running queries, and
    // new traffic queues behind it; fail fast instead. One round trip keeps the lock short.
    await pool.query(sql`
      set local lock_timeout = '3s';
      alter table oidc_model_instances
        add column payload_grant_id varchar(128),
        add column payload_account_id varchar(128),
        add column payload_uid varchar(128),
        add column payload_user_code varchar(128);
      ${createSetPayloadKeysFunction}
      create trigger oidc_model_instances__set_payload_keys
        before insert or update of payload, payload_grant_id, payload_account_id, payload_uid, payload_user_code
        on oidc_model_instances
        for each row execute procedure oidc_model_instances__set_payload_keys();
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      set local lock_timeout = '3s';
      drop trigger oidc_model_instances__set_payload_keys on oidc_model_instances;
      drop function oidc_model_instances__set_payload_keys;
      alter table oidc_model_instances
        drop column payload_grant_id,
        drop column payload_account_id,
        drop column payload_uid,
        drop column payload_user_code;
    `);
  },
};

export default alteration;
