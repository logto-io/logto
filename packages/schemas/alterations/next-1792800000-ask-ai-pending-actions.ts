import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

// Pending actions for Ask AI: a write the assistant proposes is stored here and only runs after the
// user confirms its id. The arguments are stored exactly as proposed, so confirming never takes a
// payload from the client. Scoped to the tenant like the other business tables, so the tenant's
// own database user only sees its rows.
const table = 'ai_pending_actions';

const getDatabaseName = async (pool: CommonQueryMethods) => {
  const { currentDatabase } = await pool.one<{ currentDatabase: string }>(sql`
    select current_database();
  `);

  return currentDatabase.replaceAll('-', '_');
};

const alteration: AlterationScript = {
  up: async (pool) => {
    const database = await getDatabaseName(pool);
    const baseRoleId = sql.identifier([`logto_tenant_${database}`]);
    const tableId = sql.identifier([table]);

    await pool.query(sql`
      create table if not exists ${tableId} (
        id varchar(21) primary key,
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        user_id varchar(21) not null,
        tool text not null,
        arguments jsonb not null,
        arguments_hash text not null,
        state text not null default 'pending',
        result jsonb,
        created_at timestamptz not null default now(),
        expires_at timestamptz not null,
        updated_at timestamptz not null default now(),
        constraint ${sql.identifier([`${table}_state_check`])} check (
          state in ('pending', 'confirmed', 'executed', 'cancelled', 'expired')
        )
      );

      create index ${sql.identifier([`${table}__tenant_id`])}
        on ${tableId} (tenant_id);

      create trigger set_tenant_id before insert on ${tableId}
        for each row execute procedure set_tenant_id();

      alter table ${tableId} enable row level security;

      create policy ${sql.identifier([`${table}_tenant_id`])} on ${tableId}
        as restrictive
        using (tenant_id = (select id from tenants where db_user = current_user));

      create policy ${sql.identifier([`${table}_modification`])} on ${tableId}
        using (true);

      grant select, insert, update, delete on ${tableId} to ${baseRoleId};
    `);
  },
  down: async (pool) => {
    const tableId = sql.identifier([table]);

    await pool.query(sql`
      drop policy if exists ${sql.identifier([`${table}_modification`])} on ${tableId};
      drop policy if exists ${sql.identifier([`${table}_tenant_id`])} on ${tableId};
      drop table if exists ${tableId};
    `);
  },
};

export default alteration;
