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
    const baseRole = `logto_tenant_${database}`;
    const baseRoleId = getId(baseRole);

    await pool.query(sql`
      create table service_logs (
        id varchar(21) not null,
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        type varchar(64) not null,
        payload jsonb /* @use JsonObject */ not null default '{}'::jsonb,
        created_at timestamptz not null default(now()),
        primary key (id)
      );

      create index service_logs__id
        on service_logs (id);

      create index service_logs__tenant_id__type
        on service_logs (tenant_id, type);

      revoke all privileges
        on table service_logs
        from ${baseRoleId};
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop table service_logs;
    `);
  },
};

export default alteration;
