import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table users
        add constraint users__tenant_id__id unique (tenant_id, id);
    `);

    await pool.query(sql`
      alter table organization_user_relations
        add constraint organization_user_relations__user_id__fk
          foreign key (tenant_id, user_id) references users (tenant_id, id) on update cascade on delete cascade;
    `);

    await pool.query(sql`
      drop index users__id;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      create index users__id on users (id);
    `);

    await pool.query(sql`
      alter table organization_user_relations
        drop constraint organization_user_relations__user_id__fk;
    `);

    await pool.query(sql`
      alter table users
        drop constraint users__tenant_id__id;
    `);
  },
};

export default alteration;
