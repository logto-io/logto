import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

// The tenant's MCP portal settings. One row, keyed 'default': the base domain that portal hostnames
// are created under, for example mcp.example.com gives <name>.mcp.example.com. Scoped to the tenant
// with row-level security, like the other tenant tables.
const settingsTable = 'mcp_portal_settings';

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
    const tableId = sql.identifier([settingsTable]);

    await pool.query(sql`
      create table ${tableId} (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        id varchar(32) not null default 'default',
        base_domain text,
        primary key (tenant_id, id)
      );

      create trigger set_tenant_id before insert on ${tableId}
        for each row execute procedure set_tenant_id();

      alter table ${tableId} enable row level security;

      create policy ${sql.identifier([`${settingsTable}_tenant_id`])} on ${tableId}
        as restrictive
        using (tenant_id = (select id from tenants where db_user = current_user));

      create policy ${sql.identifier([`${settingsTable}_modification`])} on ${tableId}
        using (true);

      grant select, insert, update, delete on ${tableId} to ${baseRoleId};
    `);
  },
  down: async (pool) => {
    await pool.query(sql`drop table if exists ${sql.identifier([settingsTable])}`);
  },
};

export default alteration;
