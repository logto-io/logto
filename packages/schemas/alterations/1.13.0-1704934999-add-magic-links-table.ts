import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table magic_links (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        /** The unique identifier of the link. */
        id varchar(21) not null,
        /** The token that can be used to verify the link. */
        token varchar(32) not null,
        /** The time when the link was created. */
        created_at timestamptz not null default (now()),
        /** The time when the link was consumed. */
        consumed_at timestamptz,
        primary key (id)
      );

      create index magic_links__token
        on magic_links (tenant_id, token);
    `);
    await applyTableRls(pool, 'magic_links');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'magic_links');
    await pool.query(sql`
      drop table magic_links;
    `);
  },
};

export default alteration;
