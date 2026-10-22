import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

// The function body must match `tables/users.sql` exactly, indentation included:
// `.scripts/compare-database.js` compares `pg_get_functiondef` output.
const createSetLowerColumnsFunction = sql`
  create function users__set_lower_columns() returns trigger as
$$ begin
  new.primary_email_lower = lower(new.primary_email);
  new.username_lower = lower(new.username);
  return new;
end; $$ language plpgsql;
`;

const alteration: AlterationScript = {
  up: async (pool) => {
    // `alter table` is catalog-only but queues for an exclusive lock behind running queries, and
    // new traffic queues behind it; fail fast instead. One round trip keeps the lock short.
    await pool.query(sql`
      set local lock_timeout = '3s';
      alter table users
        add column primary_email_lower varchar(384),
        add column username_lower varchar(384);
      ${createSetLowerColumnsFunction}
      create trigger users__set_lower_columns
        before insert or update of primary_email, username, primary_email_lower, username_lower
        on users
        for each row execute procedure users__set_lower_columns();
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      set local lock_timeout = '3s';
      drop trigger users__set_lower_columns on users;
      drop function users__set_lower_columns;
      alter table users
        drop column primary_email_lower,
        drop column username_lower;
    `);
  },
};

export default alteration;
