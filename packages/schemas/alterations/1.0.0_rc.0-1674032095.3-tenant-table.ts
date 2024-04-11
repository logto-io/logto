import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const defaultTenantId = 'default';
const getId = (value: string) => sql.identifier([value]);

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table tenants (
        id varchar(21) not null,
        db_user_password varchar(128),
        primary key (id)
      );
    `);

    await pool.query(sql`
      insert into tenants (${getId('id')}, ${getId('db_user_password')})
      values (${defaultTenantId}, null);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`drop table tenants;`);
  },
};

export default alteration;
