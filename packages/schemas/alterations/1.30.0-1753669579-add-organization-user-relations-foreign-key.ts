import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    // Drop the existing index in users table
    await pool.query(sql`
      drop index if exists users__id;
    `);

    // Create a new unique index in users table
    await pool.query(sql`
      create unique index users__id
        on users (tenant_id, id);
    `);

    // Apply the foreign key constraint to organization_user_relations table
    await pool.query(sql`
      alter table organization_user_relations
       add constraint organization_user_relations__user_id__fk
        foreign key (tenant_id, user_id)
        references users (tenant_id, id)
        on update cascade on delete cascade;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table organization_user_relations
       drop constraint organization_user_relations__user_id__fk;
    `);

    // Drop the unique index in users table
    await pool.query(sql`
      drop index if exists users__id;
    `);

    // Recreate the old index in users table
    await pool.query(sql`
      create index users__id
        on users (tenant_id, id);
    `);
  },
};

export default alteration;
