import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const getId = (value: string) => sql.identifier([value]);

const getDatabaseName = async (pool: CommonQueryMethods) => {
  const { currentDatabase } = await pool.one<{ currentDatabase: string }>(sql`
    select current_database();
  `);

  return currentDatabase.replaceAll('-', '_');
};

const alteration: AlterationScript = {
  up: async (pool) => {
    const database = await getDatabaseName(pool);
    const baseRoleId = getId(`logto_tenant_${database}`);

    await pool.query(sql`
      create table verification_statuses (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        id varchar(21) not null,
        user_id varchar(21) not null
          references users (id) on update cascade on delete cascade,
        created_at timestamptz not null default(now()),
        primary key (id)
      );

      create index verification_statuses__id
        on verification_statuses (tenant_id, id);

      create index verification_statuses__user_id
        on verification_statuses (tenant_id, user_id);

      create trigger set_tenant_id before insert on verification_statuses
        for each row execute procedure set_tenant_id();

      alter table verification_statuses enable row level security;

      create policy verification_statuses_tenant_id on verification_statuses to ${baseRoleId}
        using (tenant_id = (select id from tenants where db_user = current_user));

      grant select, insert, update, delete on verification_statuses to ${baseRoleId};
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop policy verification_statuses_tenant_id on verification_statuses;

      alter table verification_statuses disable row level security;

      drop table verification_statuses;
    `);
  },
};

export default alteration;
